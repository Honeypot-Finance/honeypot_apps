import { useState } from 'react';
import { cn } from '@/lib/tailwindcss';
import { trpcClient } from '@/lib/trpc';
import { wallet } from '@honeypot/shared/lib/wallet';
import { Button } from '@nextui-org/react';
import { PeddingSvg } from '@/components/svg/Pedding';
import { PoweredByAlphaKek } from '@/components/algebra/common/PoweredByAlgebra';

export type TokenGeneratedSuccessValues = {
  description?: string;
  name?: string;
  symbol?: string;
  image: string;
};

export type PromptResponse = {
  code: number;
  data:
    | TokenGeneratedSuccessValues
    | {
        tip: string;
      };
};

interface AITokenGeneratorProps {
  tokenGeneratedCallback: (tokenInfo: TokenGeneratedSuccessValues) => void;
}

export default function AITokenGenerator({
  tokenGeneratedCallback,
}: AITokenGeneratorProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [tip, setTip] = useState<string>('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  const handleAiLaunch = async () => {
    // if (state === "loading") return;
    // if (prompt.length === 0) {
    //   setState("error");
    //   setTip("Please enter a prompt");
    //   return;
    // }

    setState('loading');
    setTip('Generating token... This may take up to a minute');
    try {
      const res: string =
        await trpcClient.aiLaunchProject.generateAiProject.query({
          wallet_address: wallet.account as `0x${string}`,
          prompt_input: prompt,
        });

      setState('success');

      tokenGeneratedCallback({
        name: '',
        symbol: '',
        image: res,
        description: '',
      });
    } catch (error: any) {
      console.error('Error:', error);
      setState('error');
      if (error.message.includes('Rate limit exceeded')) {
        setTip('can only generate once per 2 minute');
      } else {
        setTip('An error occurred while generating the token');
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center gap-5">
        <textarea
          disabled={state === 'loading'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Try our AI launch with prompt"
          className="w-full bg-orange-200 rounded-[16px] px-4 py-[18px] text-black outline-none border border-black shadow-[0px_332px_93px_0px_rgba(0,0,0,0.00),0px_212px_85px_0px_rgba(0,0,0,0.01),0px_119px_72px_0px_rgba(0,0,0,0.05),0px_53px_53px_0px_rgba(0,0,0,0.09),0px_13px_29px_0px_rgba(0,0,0,0.10)] placeholder:text-black/50 text-base font-medium"
        />
        <div className="flex flex-col items-center gap-2">
          <Button
            isDisabled={state === 'loading' || prompt.length === 0}
            className="p-6 "
            onClick={() => {
              handleAiLaunch();
            }}
          >
            {state === 'loading' ? (
              <div className="relative max-h-full scale-[25%] flex items-center justify-center">
                <PeddingSvg className="w-full h-full " />
              </div>
            ) : (
              'Generate Meme Token'
            )}
          </Button>
          {/* <PoweredByAlphaKek /> */}
        </div>
      </div>
      <p
        className={cn(
          'text-black text-base font-medium ',
          state === 'success' && 'text-green-700',
          state === 'error' && 'text-red-500'
        )}
      >
        {state === 'success' ? 'Your token is ready to be launched' : tip}
      </p>
    </div>
  );
}
