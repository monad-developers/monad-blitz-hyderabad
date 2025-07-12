import { createPublicClient, http, getAddress } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http()
});

export async function resolveENS(ensName: string): Promise<string | null> {
  try {
    // Check if it's already an Ethereum address
    if (ensName.startsWith('0x') && ensName.length === 42) {
      return getAddress(ensName); // Normalize the address
    }

    // Check if it's an ENS name
    if (ensName.endsWith('.eth')) {
      console.log(`🔍 Resolving ENS: ${ensName}`);
      
      const address = await client.getEnsAddress({
        name: ensName
      });

      if (address) {
        console.log(`✅ ENS resolved: ${ensName} → ${address}`);
        return address;
      } else {
        console.log(`❌ ENS not found: ${ensName}`);
        return null;
      }
    }

    // Not an ENS name or address
    return null;
  } catch (error) {
    console.error(`❌ ENS resolution failed for ${ensName}:`, error);
    return null;
  }
}

export function isENSName(input: string): boolean {
  return input.endsWith('.eth') && input.length > 4;
}

export function isEthereumAddress(input: string): boolean {
  return input.startsWith('0x') && input.length === 42;
} 