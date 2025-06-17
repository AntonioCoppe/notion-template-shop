import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  const { error, data } = await supabaseAdmin.from('products').insert({ name }).select('*').single();
  if (error) {
    console.error('supabase insert error', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
