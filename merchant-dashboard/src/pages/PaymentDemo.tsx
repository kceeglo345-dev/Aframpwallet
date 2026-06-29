import { useState, useEffect, useCallback } from 'react'
import { initWasm, isWasmReady, generateProofClientSide } from '../services/wasmClient'
import { MerchantAPI } from '../services/api'
import type { ProofResult, ProvingKeyInfo } from '../types'

type Step = 'init' | 'fetch-pk' | 'generate' | 'result' | 'submitting' | 'done' | 'error'

export default function PaymentDemo() {
  const [wasmStatus, setWasmStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [seedHex, setSeedHex] = useState('')
  const [amount, setAmount] = useState('')
  const [pkInfo, setPkInfo] = useState<ProvingKeyInfo | null>(null)
  const [proof, setProof] = useState<ProofResult | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('init')

  useEffect(() => {
    initWasm()
      .then(() => setWasmStatus('ready'))
      .catch(() => setWasmStatus('error'))
  }, [])

  const handleFetchPk = useCallback(async () => {
    if (!seedHex.trim()) return
    setStep('fetch-pk')
    setError(null)
    try {
      const info = await MerchantAPI.getProvingKey(seedHex.trim())
      setPkInfo(info)
      setStep('generate')
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch proving key')
      setStep('error')
    }
  }, [seedHex])

  const handleGenerateProof = useCallback(async () => {
    if (!pkInfo || !amount) return
    setStep('generate')
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
      setStep('result')
    } catch (e: any) {
      setError(e?.message || 'Proof generation failed')
      setStep('error')
    }
  }, [pkInfo, amount])

  const handleSubmit = useCallback(async () => {
    if (!proof || !pkInfo || !amount) return
    setStep('submitting')
    setError(null)
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
        setStep('done')
      } else {
        setError(res.error || 'Submission failed')
        setStep('error')
      }
    } catch (e: any) {
      setError(e?.message || 'Submission failed')
      setStep('error')
    }
  }, [proof, pkInfo, amount, seedHex])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client-Side ZK Proof Demo</h1>
        <p className="text-gray-600 mb-8">
          Generate a Groth16 zero-knowledge proof entirely in the browser using WASM.
          Your secret never leaves this device.
        </p>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-indigo-800">WASM Status:</span>
            {wasmStatus === 'loading' && <span className="text-yellow-600">Loading ZK prover...</span>}
            {wasmStatus === 'ready' && <span className="text-green-600">Ready — proofs generate locally</span>}
            {wasmStatus === 'error' && <span className="text-red-600">Failed to load WASM module</span>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Fetch Merchant Proving Key</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Merchant seed hex (64 chars)"
                value={seedHex}
                onChange={e => setSeedHex(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
              />
              <button
                onClick={handleFetchPk}
                disabled={!seedHex.trim() || wasmStatus !== 'ready'}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Fetch PK
              </button>
            </div>
          </div>

          {pkInfo && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Enter Payment Amount</h2>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Amount (e.g. 42.00)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleGenerateProof}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Generate Proof (in browser)
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                The proof is generated client-side via WASM. Your customer secret is never sent to the server.
              </p>
            </div>
          )}

          {proof && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Proof Generated</h2>
              <div className="space-y-2 text-sm font-mono">
                <div><span className="text-gray-500">nullifier:</span> <span className="text-gray-800 break-all">{proof.nullifier}</span></div>
                <div><span className="text-gray-500">commitment:</span> <span className="text-gray-800 break-all">{proof.commitment}</span></div>
                <div><span className="text-gray-500">proof.a:</span> <span className="text-gray-800 break-all text-xs">{proof.a}</span></div>
              </div>
              <button
                onClick={handleSubmit}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Submit to Contract
              </button>
            </div>
          )}

          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Payment Submitted</h2>
              <p className="text-sm text-green-700 font-mono break-all">Tx: {txHash}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
