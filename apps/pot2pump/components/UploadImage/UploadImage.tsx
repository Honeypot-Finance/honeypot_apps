import { Tooltip } from '@nextui-org/react';
import Image from 'next/image';
import React, { useRef } from 'react';
import type { PutBlobResult } from '@vercel/blob';
import Dropzone from 'react-dropzone';



export interface UploadImageProps {
  onUpload: (url: string) => void;
  imagePath: string | null | undefined;
  blobName: string;
  variant?: 'icon' | 'banner';
}

export const uploadFile = async (
  file: File,
  blobName: string,
  onUpload?: (url: string) => void
): Promise<string> => {
  try {
    const response = await fetch(
      `/api/upload/upload-project-icon?filename=${blobName}`,
      {
        method: 'POST',
        body: file,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const newBlob = (await response.json()) as PutBlobResult;

    if (onUpload) {
      onUpload(newBlob.url);
    }

    return newBlob.url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export function UploadImage(props: UploadImageProps): JSX.Element {
  const fileIn = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await fetch(
          `/api/upload/upload-project-icon?filename=${props.blobName}`,
          {
            method: 'POST',
            body: file,
          }
        );

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const newBlob = (await response.json()) as PutBlobResult;

        props.onUpload(newBlob.url);
      } catch (error) {
        console.error('Upload failed:', error);
        // Optionally, you could call an onError callback here if provided
      }
    }
  };

  return (
    <Dropzone
      onDrop={(file: File[]) => {
        uploadFile(file[0], props.blobName, props.onUpload).then((url) => {
          props.onUpload(url);
        });
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div {...getRootProps()}>
          <Tooltip content="Upload new project icon">
            <div className="flex justify-center items-center">
              {(props.variant === 'banner' && (
                <Image
                  src={props?.imagePath ?? '/images/banner-empty.png'}
                  alt="banner"
                  className="rounded-[11.712px] hover:bg-[#ECC94E20] w-[3rem] h-[3rem] self-center cursor-pointer object-fill"
                  width={48}
                  height={48}
                  onClick={() => fileIn.current?.click()}
                ></Image>
              )) || (
                <Image
                  src={
                    !!props.imagePath
                      ? props.imagePath
                      : '/images/empty-logo.png'
                  }
                  alt="icon"
                  className="rounded-[11.712px] hover:bg-[#ECC94E20] w-[3rem] h-[3rem] self-center cursor-pointer  hover:scale-150 transition-all duration-300"
                  width={100}
                  height={100}
                  onClick={() => fileIn.current?.click()}
                ></Image>
              )}
            </div>
          </Tooltip>
          <input
            ref={fileIn}
            type="file"
            className="hidden"
            onChange={(e) => {
              handleFileChange(e);
            }}
            accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif"
            {...getInputProps()}
          />
        </div>
      )}
    </Dropzone>
  );
}
