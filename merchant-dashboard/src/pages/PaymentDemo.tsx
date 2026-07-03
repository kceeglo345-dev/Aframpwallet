import { useState, useEffect, useCallback } from 'react'
import { initWasm, generateProofClientSide } from '../services/wasmClient'
import { MerchantAPI } from '../services/api'
import type { ProofResult, ProvingKeyInfo } from '../types'

export default function PaymentDemo() {
  const [wasmStatus, setWasmStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [seedHex, setSeedHex] = useState('')
  const [amount, setAmount] = useState('')
  const [pkInfo, setPkInfo] = useState<ProvingKeyInfo | null>(null)
  const [proof, setProof] = useState<ProofResult | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    initWasm()
      .then(() => setWasmStatus('ready'))
      .catch(() => setWasmStatus('error'))
  }, [])

  const handleFetchPk = useCallback(async () => {
    if (!seedHex.trim()) return
    setError(null)
    try {
      const info = await MerchantAPI.getProvingKey(seedHex.trim())
      setPkInfo(info)
      setActiveStep(1)
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch proving key')
    }
  }, [seedHex])

  const handleGenerateProof = useCallback(async () => {
    if (!pkInfo || !amount) return
    setError(null)

    const customerSecret = crypto.getRandomValues(new Uint8Array(32))
    const secretHex = Array.from(customerSecret).map(b => b.toString(16).padStart(2, '0')).join('')

    try {
      const result = generateProofClientSide(
        pkInfo.pk_hex,
        secretHex,
        BigInt(Math.round(parseFloat(amount) * 100)),
        pkInfo.merchant_id,
      )
      setProof(result)
      setActiveStep(2)
    } catch (e: any) {
      setError(e?.message || 'Proof generation failed')
    }
  }, [pkInfo, amount])

  const handleSubmit = useCallback(async () => {
    if (!proof || !pkInfo || !amount) return
    setError(null)
    setActiveStep(3)
    try {
      const res = await MerchantAPI.submitProof({
        seed: seedHex.trim(),
        a: proof.a,
        b: proof.b,
        c: proof.c,
        nullifier: proof.nullifier,
        commitment: proof.commitment,
        amount: Math.round(parseFloat(amount) * 100),
        customer_id: 'demo-customer',
      })
      if (res.success) {
        setTxHash(res.tx_hash || null)
        setActiveStep(4)
      } else {
        setError(res.error || 'Submission failed')
      }
    } catch (e: any) {
      setError(e?.message || 'Submission failed')
    }
  }, [proof, pkInfo, amount, seedHex])

  const steps = [
    { num: 1, label: 'Fetch Proving Key', done: !!pkInfo },
    { num: 2, label: 'Generate ZK Proof', done: !!proof },
    { num: 3, label: 'Submit to Contract', done: !!txHash },
    { num: 4, label: 'Payment Confirmed', done: !!txHash },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payment Stream</h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate a Groth16 zero-knowledge proof entirely in your browser. Your secret never leaves this device.
        </p>
      </div>

      {/* WASM status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
        wasmStatus === 'ready'
          ? 'bg-[#2ed42b]/8 border-[#2ed42b]/20'
          : wasmStatus === 'error'
            ? 'bg-red-500/8 border-red-500/20'
            : 'bg-yellow-500/8 border-yellow-500/20'
      }`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          wasmStatus === 'ready' ? 'bg-[#2ed42b]/15 text-[#2ed42b]' :
          wasmStatus === 'error' ? 'bg-red-500/15 text-red-400' :
          'bg-yellow-500/15 text-yellow-400'
        }`}>
          {wasmStatus === 'ready' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : wasmStatus === 'error' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {wasmStatus === 'ready' && 'WASM Prover Ready — proofs generate locally'}
            {wasmStatus === 'loading' && 'Loading ZK prover module...'}
            {wasmStatus === 'error' && 'Failed to load WASM module'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {wasmStatus === 'ready' ? 'Groth16 · BN254 · 237 KB compiled' : 'Client-side zero-knowledge proof generation'}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 ${
              step.done
                ? 'bg-green-500/10 border-green-500/25 text-green-400'
                : activeStep === i
                  ? 'bg-white/5 border-white/15 text-white'
                  : 'bg-[#111118] border-white/8 text-gray-600'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step.done ? 'bg-green-500 text-white' : 'bg-[#0d0d14] text-gray-500'
              }`}>
                {step.done ? '✓' : step.num}
              </span>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-4 ${step.done ? 'bg-green-500/30' : 'bg-white/8'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Fetch PK */}
      <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-green-500/15 text-[#2ed42b] flex items-center justify-center text-xs font-bold">1</span>
          <h2 className="text-base font-semibold text-white">Fetch Merchant Proving Key</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter merchant seed hex (64 chars)"
            value={seedHex}
            onChange={e => setSeedHex(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#0d0d14] border border-white/8 rounded-xl text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-500/30 transition-colors"
          />
          <button
            onClick={handleFetchPk}
            disabled={!seedHex.trim() || wasmStatus !== 'ready'}
            className="px-5 py-2.5 bg-[#2ed42b] text-black rounded-xl text-sm font-bold hover:bg-[#22b020] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Fetch PK
          </button>
        </div>
        {pkInfo && (
          <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Proving key loaded · merchant_id: {pkInfo.merchant_id.slice(0, 16)}...
          </div>
        )}
      </div>

      {/* Step 2: Generate Proof */}
      {pkInfo && (
        <div className="bg-[#111118] border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-green-500/15 text-[#2ed42b] flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-base font-semibold text-white">Enter Payment Amount</h2>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-[#0d0d14] border border-white/8 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-500/30 transition-colors"
              />
            </div>
            <button
              onClick={handleGenerateProof}
              disabled={!amount || parseFloat(amount) <= 0}
              className="px-5 py-2.5 bg-[#2ed42b] text-black rounded-xl text-sm font-bold hover:bg-[#22b020] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Generate Proof
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Proof is generated client-side via WASM. Your customer secret never leaves this browser.
          </p>
        </div>
      )}

      {/* Step 3: Proof Result */}
      {proof && (
        <div className="bg-[#111118] border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-[#2ed42b] text-black flex items-center justify-center text-xs font-bold">✓</span>
            <h2 className="text-base font-semibold text-white">Proof Generated</h2>
            <span className="ml-auto text-xs text-[#2ed42b] bg-[#2ed42b]/10 px-2 py-1 rounded-full border border-[#2ed42b]/20">Valid</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex gap-2 p-3 rounded-xl bg-[#0d0d14] border border-white/5">
              <span className="text-gray-600 flex-shrink-0">nullifier:</span>
              <span className="text-[#2ed42b] break-all">{proof.nullifier}</span>
            </div>
            <div className="flex gap-2 p-3 rounded-xl bg-[#0d0d14] border border-white/5">
              <span className="text-gray-600 flex-shrink-0">commitment:</span>
              <span className="text-[#2ed42b] break-all">{proof.commitment}</span>
            </div>
            <div className="flex gap-2 p-3 rounded-xl bg-[#0d0d14] border border-white/5">
              <span className="text-gray-600 flex-shrink-0">proof.a:</span>
              <span className="text-gray-400 break-all">{proof.a.slice(0, 64)}...</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 w-full py-3 bg-[#2ed42b] text-black rounded-xl text-sm font-bold hover:bg-[#22b020] transition-colors cursor-pointer"
          >
            Submit to Soroban Contract
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {txHash && (
        <div className="bg-[#2ed42b]/8 border border-[#2ed42b]/20 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#2ed42b]/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#2ed42b]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white mb-1">Payment Submitted</h2>
          <p className="text-xs text-gray-500 mb-3">Your private payment has been verified on-chain</p>
          <p className="text-xs text-[#2ed42b] font-mono break-all bg-[#0d0d14] p-3 rounded-xl border border-white/5">
            {txHash}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-400">Error</p>
            <p className="text-xs text-gray-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
