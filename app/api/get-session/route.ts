import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    return NextResponse.json({
      email: session.customer_email || session.customer_details?.email,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || 'eur',
      id: session.id,
      items: session.line_items?.data.map((item: any) => ({
        name: item.description || item.price?.product?.name || 'Article',
        quantity: item.quantity || 1,
        price: item.amount_total ? (item.amount_total / 100) / (item.quantity || 1) : 0,
        image: item.price?.product?.images?.[0] || null,
      })) || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}