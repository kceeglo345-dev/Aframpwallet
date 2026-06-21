use soroban_sdk::{Bytes, BytesN, Env, Vec, contracttype};

const ROOT_HISTORY_SIZE: u32 = 100;

#[derive(Clone, Debug)]
pub enum MerkleError {
    AlreadyInitialized,
    WrongLevels,
    MerkleTreeFull,
    NotInitialized,
    Overflow,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MerkleDataKey {
    Levels,
    CurrentRootIndex,
    NextIndex,
    FilledSubtree(u32),
    Zeroes(u32),
    Root(u32),
}

pub struct MerkleTree;

impl MerkleTree {
    pub fn init(env: &Env, levels: u32) {
        let storage = env.storage().persistent();

        let zeros = Self::compute_zero_hashes(env, levels);

        for i in 0..=levels {
            let z = zeros.get(i).unwrap();
            storage.set(&MerkleDataKey::FilledSubtree(i), &z);
            storage.set(&MerkleDataKey::Zeroes(i), &z);
        }

        storage.set(&MerkleDataKey::Root(0), &zeros.get(levels).unwrap());
        storage.set(&MerkleDataKey::CurrentRootIndex, &0u32);
        storage.set(&MerkleDataKey::NextIndex, &0u64);
        storage.set(&MerkleDataKey::Levels, &levels);
    }

    pub fn insert(env: &Env, leaf: BytesN<32>) -> Result<u64, MerkleError> {
        let storage = env.storage().persistent();

        let levels: u32 = storage
            .get(&MerkleDataKey::Levels)
            .ok_or(MerkleError::NotInitialized)?;
        let next_index: u64 = storage
            .get(&MerkleDataKey::NextIndex)
            .ok_or(MerkleError::NotInitialized)?;
        let mut root_index: u32 = storage
            .get(&MerkleDataKey::CurrentRootIndex)
            .ok_or(MerkleError::NotInitialized)?;
        let max_leaves = 1u64.checked_shl(levels).ok_or(MerkleError::WrongLevels)?;

        if next_index >= max_leaves {
            return Err(MerkleError::MerkleTreeFull);
        }

        let mut current_hash = leaf;
        let mut current_index = next_index;

        for lvl in 0..levels {
            let is_right = current_index & 1 == 1;
            if is_right {
                let left: BytesN<32> = storage
                    .get(&MerkleDataKey::FilledSubtree(lvl))
                    .ok_or(MerkleError::NotInitialized)?;
                let mut pair = [0u8; 64];
                pair[..32].copy_from_slice(&left.to_array());
                pair[32..].copy_from_slice(&current_hash.to_array());
                current_hash = env
                    .crypto()
                    .sha256(&Bytes::from_array(env, &pair))
                    .to_bytes();
            } else {
                let zero: BytesN<32> = storage
                    .get(&MerkleDataKey::Zeroes(lvl))
                    .ok_or(MerkleError::NotInitialized)?;
                storage.set(&MerkleDataKey::FilledSubtree(lvl), &current_hash);
                let mut pair = [0u8; 64];
                pair[..32].copy_from_slice(&current_hash.to_array());
                pair[32..].copy_from_slice(&zero.to_array());
                current_hash = env
                    .crypto()
                    .sha256(&Bytes::from_array(env, &pair))
                    .to_bytes();
            }
            current_index >>= 1;
        }

        root_index = root_index
            .checked_add(1)
            .ok_or(MerkleError::Overflow)?
            % ROOT_HISTORY_SIZE;
        storage.set(&MerkleDataKey::Root(root_index), &current_hash);
        storage.set(&MerkleDataKey::CurrentRootIndex, &root_index);
        storage.set(&MerkleDataKey::NextIndex, &(next_index + 1));

        Ok(next_index)
    }

    fn compute_zero_hashes(env: &Env, levels: u32) -> Vec<BytesN<32>> {
        let mut zeros: Vec<BytesN<32>> = Vec::new(env);
        zeros.push_back(BytesN::from_array(env, &[0u8; 32]));

        for i in 1..=levels {
            let prev = zeros.get(i - 1).unwrap();
            let mut pair = [0u8; 64];
            pair[..32].copy_from_slice(&prev.to_array());
            pair[32..].copy_from_slice(&prev.to_array());
            zeros.push_back(
                env.crypto()
                    .sha256(&Bytes::from_array(env, &pair))
                    .to_bytes(),
            );
        }

        zeros
    }

    pub fn get_last_root(env: &Env) -> Result<BytesN<32>, MerkleError> {
        let storage = env.storage().persistent();
        let root_index: u32 = storage
            .get(&MerkleDataKey::CurrentRootIndex)
            .ok_or(MerkleError::NotInitialized)?;
        storage
            .get(&MerkleDataKey::Root(root_index))
            .ok_or(MerkleError::NotInitialized)
    }

    pub fn is_known_root(env: &Env, root: &BytesN<32>) -> Result<bool, MerkleError> {
        let zero = BytesN::from_array(env, &[0u8; 32]);
        if *root == zero {
            return Ok(false);
        }

        let storage = env.storage().persistent();
        let current_root_index: u32 = storage
            .get(&MerkleDataKey::CurrentRootIndex)
            .ok_or(MerkleError::NotInitialized)?;

        let mut i = current_root_index;
        loop {
            if let Some(r) = storage.get::<MerkleDataKey, BytesN<32>>(&MerkleDataKey::Root(i)) {
                if &r == root {
                    return Ok(true);
                }
            }
            i = (i + 1) % ROOT_HISTORY_SIZE;
            if i == current_root_index {
                break;
            }
        }
        Ok(false)
    }
}
