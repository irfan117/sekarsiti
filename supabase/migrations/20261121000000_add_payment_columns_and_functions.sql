-- ==============================================================================
-- Migration: 20261121000000_add_payment_columns_and_functions.sql
-- Menambahkan kolom pembayaran dan fungsi transisi status atomik pada invitations
-- ==============================================================================

-- 1. Tambahkan kolom pembayaran secara aman (idempotent IF NOT EXISTS)
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_amount INT DEFAULT 49000,
  ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}'::jsonb;

-- Indeks performa status pembayaran
CREATE INDEX IF NOT EXISTS idx_invitations_payment_status ON public.invitations(payment_status);

-- 2. Fungsi Transisi Status Pembayaran Atomik (Anti-Race Condition & Safe State Machine)
CREATE OR REPLACE FUNCTION public.process_payment_update(
  p_order_id VARCHAR,
  p_payment_status VARCHAR,
  p_amount INT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_current_status VARCHAR;
  v_current_pay_status VARCHAR;
  v_new_inv_status VARCHAR;
  v_result JSONB;
BEGIN
  -- Ambil record pesanan saat ini dengan kunci baris FOR UPDATE (Concurrency Protection)
  SELECT status, payment_status
  INTO v_current_status, v_current_pay_status
  FROM public.invitations
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'ORDER_NOT_FOUND',
      'message', 'Pesanan tidak ditemukan di database.'
    );
  END IF;

  -- Lindungi status settlement: Tidak boleh menurunkan transaksi yang sudah berhasil dibayar
  IF v_current_pay_status = 'settlement' AND p_payment_status IN ('pending', 'expired', 'failed', 'cancel', 'deny') THEN
    RETURN jsonb_build_object(
      'success', true,
      'code', 'ALREADY_SETTLED',
      'message', 'Pesanan telah berstatus settlement; status tidak dapat diturunkan kembali.',
      'current_status', v_current_status,
      'current_payment_status', v_current_pay_status
    );
  END IF;

  -- Tentukan status publikasi undangan berdasarkan status pembayaran baru
  IF p_payment_status = 'settlement' THEN
    v_new_inv_status := 'published';
  ELSE
    v_new_inv_status := COALESCE(v_current_status, 'pending');
  END IF;

  -- Perbarui status secara atomik
  UPDATE public.invitations
  SET
    status = v_new_inv_status,
    payment_status = p_payment_status,
    payment_amount = COALESCE(p_amount, payment_amount),
    payment_data = COALESCE(payment_data, '{}'::jsonb) || p_metadata,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'UPDATED',
    'order_id', p_order_id,
    'old_payment_status', v_current_pay_status,
    'new_payment_status', p_payment_status,
    'old_invitation_status', v_current_status,
    'new_invitation_status', v_new_inv_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
