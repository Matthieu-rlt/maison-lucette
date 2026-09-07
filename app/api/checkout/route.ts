import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, shippingOption, userEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide' }, { status: 400 });
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
      // --- DEMANDER L'ADRESSE DE LIVRAISON SI C'EST UNE LIVRAISON ---
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'DE', 'IT', 'ES', 'LU'], // Adapte selon tes zones de livraison
      },
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Erreur API Stripe Checkout:', err);
    return NextResponse.json({ error: err.message || 'Erreur interne du serveur' }, { status: 500 });
  }
}
