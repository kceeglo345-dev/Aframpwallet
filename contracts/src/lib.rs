#![no_std]
#![allow(dead_code)]

mod groth16;
mod merkle_tree;

use groth16::{Groth16Proof, Groth16VerifierClient};
use merkle_tree::MerkleTree;
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Bytes, BytesN, Env, Map,
    Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotAuthorized = 1,
    InvalidCommitment = 2,
    AlreadySpent = 3,
    InvalidProof = 4,
    CommitmentNotFound = 5,
    NotInitialized = 6,
    MerkleTreeFull = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Commitment {
    pub nullifier: Bytes,
    pub commitment: Bytes,
    pub value: u128,
    pub asset: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommitmentData {
    pub index: u64,
    pub value: i128,
    pub owner: Address,
    pub asset: Address,
}

#[contracttype]
#[derive(Clone)]
pub struct Proof {
    pub proof: Groth16Proof,
    pub public_inputs: Vec<BytesN<32>>,
}

#[contracttype]
pub enum DataKey {
    Verifier,
    Nullifiers,
    Commitment(Bytes),
}

#[contract]
pub struct PrivacyPool;

#[contractimpl]
impl PrivacyPool {
    pub fn __constructor(env: Env, verifier: Address) {
        env.storage()
            .persistent()
            .set(&DataKey::Verifier, &verifier);
        env.storage()
            .persistent()
            .set(&DataKey::Nullifiers, &Map::<Bytes, bool>::new(&env));
        MerkleTree::init(&env, 32);
    }

    pub fn deposit(
        env: Env,
        sender: Address,
        commitment: Bytes,
        amount: i128,
        asset: Address,
    ) -> Result<(), Error> {
        sender.require_auth();

        let token_client = token::Client::new(&env, &asset);
        token_client.transfer(&sender, &env.current_contract_address(), &amount);

        let cmt32: BytesN<32> = BytesN::try_from(commitment.clone())
            .map_err(|_| Error::InvalidCommitment)?;
        let index = MerkleTree::insert(&env, cmt32).map_err(|_| Error::MerkleTreeFull)?;

        env.storage().persistent().set(
            &DataKey::Commitment(commitment),
            &CommitmentData {
                index,
                value: amount,
                owner: sender,
                asset,
            },
        );

        Ok(())
    }

    pub fn withdraw(
        env: Env,
        recipient: Address,
        proof: Proof,
        commitment: Bytes,
        nullifier: Bytes,
    ) -> Result<(), Error> {
        let nullifiers: Map<Bytes, bool> = env
            .storage()
            .persistent()
            .get(&DataKey::Nullifiers)
            .ok_or(Error::NotInitialized)?;
        if nullifiers.contains_key(nullifier.clone()) {
            return Err(Error::AlreadySpent);
        }

        let data: CommitmentData = env
            .storage()
            .persistent()
            .get(&DataKey::Commitment(commitment.clone()))
            .ok_or(Error::CommitmentNotFound)?;

        let verifier_addr: Address = env
            .storage()
            .persistent()
            .get(&DataKey::Verifier)
            .ok_or(Error::NotInitialized)?;
        let verifier_client = Groth16VerifierClient::new(&env, &verifier_addr);
        let valid = verifier_client.verify(&proof.proof, &proof.public_inputs);
        if !valid {
            return Err(Error::InvalidProof);
        }

        let mut nullifiers = nullifiers;
        nullifiers.set(nullifier, true);
        env.storage()
            .persistent()
            .set(&DataKey::Nullifiers, &nullifiers);

        let token_client = token::Client::new(&env, &data.asset);
        token_client.transfer(&env.current_contract_address(), &recipient, &data.value);

        env.storage()
            .persistent()
            .remove(&DataKey::Commitment(commitment));

        Ok(())
    }
}
