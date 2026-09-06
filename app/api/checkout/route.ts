import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingOption, userEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
    }

    // --- MISE À JOUR DU STOCK ---
    for (const item of items) {
      const cleanTitle = item.name ? item.name.split(' (Taille')[0].trim() : '';
      const sizeKey = item.size;

      if (cleanTitle && sizeKey) {
        const { data: product } = await supabase
          .from('products')
          .select('*')
          .eq('title', cleanTitle)
          .single();

        if (product && product.stock && typeof product.stock === 'object') {
          const currentStock = Number(product.stock[sizeKey]) || 0;
          const orderedQty = Number(item.quantity) || 1;
          const newStock = Math.max(0, currentStock - orderedQty);

          const updatedStock = {
            ...product.stock,
            [sizeKey]: newStock,
          };

          await supabase
            .from('products')
            .update({ stock: updatedStock })
            .eq('id', product.id);
        }
      }
    }

    const line_items: any[] = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || item.title || 'Article Maison Lucette',
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price || 0) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));

    // --- CALCUL DU SOUS-TOTAL POUR LA LIVRAISON ---
    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price || 0) * (Number(item.quantity) || 1)), 0);
    const isFreeShipping = subtotal >= 120;

    // N'ajoute les frais de port que si la méthode est europe ET que le montant est inférieur à 120 €
    if (shippingOption === 'europe' && !isFreeShipping) {
      line_items.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Livraison Europe',
          },
          unit_amount: 1500,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: userEmail || undefined,
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Erreur API Stripe Checkout:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}