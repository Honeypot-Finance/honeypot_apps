import { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { StyledButton } from '../../styled';
import FormInput from '../../Input';
import { BtnWrapper, FormContainer } from './styled';
import { ethers } from 'ethers';
import APIAccessPayment from '@/lib/abis/beravote/abi/APIAccessPayment.json';
import { wallet } from '@honeypot/shared/lib/wallet';
import { WrappedToastify } from '@/lib/wrappedToastify';
import { FtoPairContract } from '@/services/contract/launches/fto/ftopair-contract';
import { MemePairContract } from '@/services/contract/launches/pot2pump/memepair-contract';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { trpcClient } from '@/lib/trpc';
import { toast } from 'react-toastify';
import { createSiweMessage } from '@/lib/siwe';

const payContract = '0x166a064C9D0E243fea5d9afA3E7B06a8b94E05F9';
const ethersProvider =
  typeof window !== 'undefined' && window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : null;

function toDataURL(src: string, callback: (arg0: string) => void) {
  var image = new Image();
  image.crossOrigin = 'Anonymous';
  image.onload = function () {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    // @ts-ignore
    canvas.height = this.naturalHeight;
    // @ts-ignore
    canvas.width = this.naturalWidth;
    // @ts-ignore
    context.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL('image/jpeg');
    callback(dataURL);
  };
  image.src = src;
}

const createDaoSpace = async (requestBody: {
  data: {
    name: any;
    description: any;
    symbol: any;
    decimals: number; // usually 18, WBTC is 8 decimals
    logo: any;
    website: any;
    forum: any;
    twitter: any;
    assets: {
      symbol: any;
      decimals: number; // usually 18, WBTC is 8 decimals
      votingThreshold: string; // "1000000000000000000", // voting threshold 1 token (18 decimals)
      type: string;
      contract: string;
      chain: string;
      votingWeight: number;
      name: any;
      ss58Format: number;
    }[];
    weightStrategy: string[];
    proposalThreshold: string;
    pubkey: string;
    address: string;
    timestamp: number;
  };
  address: string;
  signature: any;
}) => {
  const cloudflareCorsProxy =
    'https://white-mud-e962.forgingblock.workers.dev/corsproxy/?apiurl=';
  try {
    const response = await fetch(
      cloudflareCorsProxy + 'https://beravote.com/api/wlspaces',
      {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data);
      return { success: true, data };
    } else {
      console.error('Error:', response.statusText);
      return { success: false, error: response.statusText };
    }
  } catch (error) {
    console.error('Request failed:', error);
    return { success: false, error };
  }
};

const handleYes = async (
  values: {
    name: any;
    description: any;
    ticker: any;
    logo: any;
    website: any;
    forum: any;
    twitter: any;
  },
  signer: ethers.Signer,
  paymentFee: any,
  pair: FtoPairContract | MemePairContract
) => {
  console.log('Form Data:', values);
  console.log('paymentFee', paymentFee);
  const address = await signer.getAddress();
  console.log(address);
  const paymentContract = new ethers.Contract(
    payContract,
    APIAccessPayment,
    signer
  );

  const createSpaceToast = WrappedToastify.pending({
    title: 'Creating Governance Space',
    message: 'Please wait...',
    options: { autoClose: false },
  });

  const tx = await paymentContract.purchaseAccessFor(address, {
    value: paymentFee,
  });

  const receipt = await tx.wait();

  toast.dismiss(createSpaceToast);
  if (receipt.status === 1) {
    WrappedToastify.success({
      title: 'Payment successful',
      message: 'Creating Governance Space',
    });
    console.log('Transaction succeeded:', receipt);
    if (!pair.launchedToken) {
      console.error('pair.launchedToken is undefined');
      return;
    }
    const timestamp = parseInt((Date.now() / 1000).toString());
    const pubkey = address;

    const data = {
      name: values.name,
      description: values.description,
      symbol: values.ticker,
      decimals: pair.launchedToken?.decimals, // usually 18, WBTC is 8 decimals
      logo: values.logo,
      website: values.website,
      forum: values.forum,
      twitter: values.twitter,
      assets: [
        {
          symbol: pair.launchedToken.symbol,
          decimals: pair.launchedToken.decimals,
          votingThreshold: Math.pow(10, pair.launchedToken.decimals).toFixed(), // "1000000000000000000", // voting threshold 1 token (18 decimals)
          type: 'erc20',
          contract: pair.launchedToken.address,
          chain: 'berachain-b2',
          votingWeight: 1,
          name: pair.launchedToken.name,
          ss58Format: 80084,
        },
      ],
      weightStrategy: ['balance-of'],
      proposalThreshold: '0',
      pubkey: pubkey,
      address: pubkey,
      timestamp: timestamp,
    };

    const msg = JSON.stringify({
      ...data,
      timestamp: timestamp,
    });
    const stringToHex = (str: string) => {
      return (
        '0x' +
        Array.from(str)
          .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('')
      );
    };
    const hex = stringToHex(msg);
    const signatureToastr = WrappedToastify.pending({
      title: 'Sign message',
      message: 'Please sign the message to create Governance space',
      options: { autoClose: false },
    });
    const signature = await window.ethereum
      .request({
        method: 'personal_sign',
        params: [hex, address],
      })
      .then((result: any) => {
        toast.dismiss(signatureToastr);

        console.log('Signature:', result);
        if (result) {
          WrappedToastify.success({
            title: 'Message signed',
            message: 'Creating Governance space',
          });
        }

        return result;
      })
      .catch((error: any) => {
        toast.dismiss(signatureToastr);
        WrappedToastify.error({
          title: 'Failed to sign message',
          message: 'Failed to create Governance space',
        });
        console.error('Failed to sign message:', error);
      });

    const requestBody = {
      data,
      address: pubkey,
      signature: signature,
    };

    const saveSpaceToast = WrappedToastify.pending({
      title: 'Saving Governance Space',
      message: 'Please wait...',
      options: { autoClose: false },
    });
    const result = await createDaoSpace(requestBody);

    toast.dismiss(saveSpaceToast);

    if (result.success) {
      console.log('https://beravote.com/space/' + result.data.spaceId);
      WrappedToastify.success({
        title: 'Governance Space created: ',
        message: 'https://beravote.com/space/' + result.data.spaceId,
      });
      await createSiweMessage(
        wallet.account,
        'Sign In With Honeypot',
        wallet.walletClient
      );

      trpcClient.projects.createOrUpdateProjectInfo
        .mutate({
          chain_id: wallet.currentChainId,
          pair: pair.address,
          beravote_space_id: result.data.spaceId,
        })
        .then(() => {
          //refresh page
          window.location.reload();
        });
    } else {
      WrappedToastify.error({ message: 'Failed to create Governance space' });
      console.error('Failed to create DAO space:', result.error);
    }
  } else {
    WrappedToastify.error({ message: 'Failed to create Governance space' });

    console.log('Transaction failed:', receipt);
  }
};

const BeraVoteForm = observer(
  ({ pair }: { pair: FtoPairContract | MemePairContract }) => {
    const [logoBase64, setLogoBase64] = useState('');
    const [paymentFee, setPaymentFee] = useState('');
    const [formSpaceId, setFormSpaceId] = useState(pair.projectName);
    // ethers v6 returns a promise from getSigner(); v5 returned it synchronously.
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    useEffect(() => {
      if (!ethersProvider) {
        return;
      }
      let cancelled = false;
      ethersProvider.getSigner().then(
        (resolved) => !cancelled && setSigner(resolved),
        () => !cancelled && setSigner(null)
      );
      return () => {
        cancelled = true;
      };
    }, []);
    const [allCreatedSpaces, setAllCreatedSpaces] = useState<string[]>([]);

    useEffect(() => {
      const fetchAllSpaces = async () => {
        const response = await fetch(
          'https://beravote.com/api/spaces-without-filter'
        );
        const data = await response.json();
        setAllCreatedSpaces(Object.keys(data).map((key) => data[key].name));
      };
      fetchAllSpaces();
    }, []);

    //convert pair.logoUrl to base64
    useEffect(() => {
      if (pair.logoUrl) {
        const imageUrl = `/api/proxy?imageUrl=${encodeURIComponent(
          pair.logoUrl as string
        )}`;
        toDataURL(imageUrl, (dataUrl: string) => {
          console.log(dataUrl);
          setLogoBase64(dataUrl);
        });
        console.log('logoBase64', logoBase64);
      }
    }, [pair.logoUrl]);

    useEffect(() => {
      if (!signer) {
        return;
      }
      const fetchPaymentFee = async () => {
        const paymentContract = new ethers.Contract(
          payContract,
          APIAccessPayment,
          signer
        );
        const fee = await paymentContract.accessFee();
        setPaymentFee(fee);
      };
      fetchPaymentFee();
    }, [signer]);

    return (
      <Formik
        initialValues={{
          name: pair.projectName ?? pair.launchedToken?.name,
          ticker: pair.launchedToken?.symbol,
          description: pair.description,
          website: pair.website,
          twitter: pair.twitter,
          github: '',
          doc: '',
          forum: '',
          logo: logoBase64,
          createDaoSpace: true,
        }}
        onSubmit={(values) => {
          console.log('Form Data:', values);
          if (values.createDaoSpace === true) {
            values.logo = logoBase64;
            signer && handleYes(values, signer, paymentFee, pair);
          }
        }}
      >
        {({ setFieldValue, values }) => (
          <FormContainer>
            <Form>
              <div className="flex flex-col w-full justify-center items-center gap-2">
                <h2 className="text-xl">What is voting space?</h2>
                <p>
                  Voting space is a decentralized autonomous organization (DAO)
                  where users can vote on proposals and make decisions on the
                  project.{' '}
                </p>
                <p>
                  <Link
                    href={'https://quicksnap.gitbook.io/beravote'}
                    className="text-yellow underline"
                  >
                    learn more on beravote
                  </Link>
                </p>
                <p>
                  cost of dao creation:{' '}
                  {paymentFee && ethers.formatEther(paymentFee)} Bera
                </p>
              </div>

              <FormInput
                label="Your Space Id"
                name="name"
                placeholder="Please enter the website URL"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue('name', e.target.value);
                  setFormSpaceId(e.target.value);
                }}
              />

              {allCreatedSpaces.includes(formSpaceId) && (
                <div className="text-red-500">
                  This space id is already taken
                </div>
              )}

              <BtnWrapper>
                <StyledButton
                  disabled={allCreatedSpaces.includes(formSpaceId)}
                  type="submit"
                >
                  Create Space
                </StyledButton>
              </BtnWrapper>

              {/* <pre className="w-full max-w-full text-wrap">
                  {JSON.stringify(values).replace(",", ",\n")}
                </pre> */}
            </Form>
          </FormContainer>
        )}
      </Formik>
    );
  }
);

export default BeraVoteForm;
