import { NextApiRequest, NextApiResponse } from 'next';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { AllInOneVaultABI } from '@/lib/abis/all-in-one-vault';
import { ALL_IN_ONE_VAULT_PROXY } from '@/config/algebra/addresses';

// Create a public client for querying the blockchain
const client = createPublicClient({
  chain: base,
  transport: http(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the receipt ID from the query parameters
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Receipt ID is required' });
  }
  
  try {
    // Convert ID to bigint
    const receiptId = BigInt(id.toString());
    
    // Fetch receipt data from the contract
    const receipt = await client.readContract({
      address: ALL_IN_ONE_VAULT_PROXY,
      abi: AllInOneVaultABI,
      functionName: 'receipts',
      args: [receiptId],
    });
    
    // Format the response
    const formattedReceipt = {
      user: receipt[0],
      token: receipt[1],
      receiptWeight: receipt[2],
      claimableAt: receipt[3],
      claimed: receipt[4],
    };
    
    return res.status(200).json({ receipt: formattedReceipt });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return res.status(500).json({ error: 'Failed to fetch receipt data' });
  }
}
