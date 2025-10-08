import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import {
  UploadImage,
  uploadFile,
} from '../../../components/UploadImage/UploadImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  const mockReact = require('react');
  return ({ src, alt, onClick, ...props }: any) =>
    mockReact.createElement('img', { src, alt, onClick, ...props });
});

// Mock react-dropzone
jest.mock('react-dropzone', () => {
  return ({ onDrop, children }: any) => {
    const mockGetRootProps = () => ({
      'data-testid': 'dropzone',
      onClick: () =>
        onDrop([new File(['test'], 'test.png', { type: 'image/png' })]),
    });
    const mockGetInputProps = () => ({
      'data-testid': 'file-input',
    });

    return children({
      getRootProps: mockGetRootProps,
      getInputProps: mockGetInputProps,
    });
  };
});

// Mock NextUI Tooltip
jest.mock('@nextui-org/react', () => {
  const mockReact = require('react');
  return {
    Tooltip: ({
      children,
      content,
    }: {
      children: React.ReactNode;
      content: string;
    }) => mockReact.createElement('div', { title: content }, children),
  };
});

// Mock fetch for file upload
global.fetch = jest.fn();

describe('UploadImage', () => {
  let mockOnUpload: jest.Mock;

  beforeEach(() => {
    mockOnUpload = jest.fn();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with default empty logo', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveAttribute('src', '/images/empty-logo.png');
    });

    it('should render with provided image path', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath="/custom-logo.png"
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveAttribute('src', '/custom-logo.png');
    });

    it('should render banner variant correctly', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
          variant="banner"
        />
      );

      const image = screen.getByAltText('banner');
      expect(image).toHaveAttribute('src', '/images/banner-empty.png');
    });

    it('should render banner with custom image', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath="/custom-banner.png"
          blobName="test-blob"
          variant="banner"
        />
      );

      const image = screen.getByAltText('banner');
      expect(image).toHaveAttribute('src', '/custom-banner.png');
    });
  });

  describe('File Upload via Input', () => {
    it('should handle file selection through input', async () => {
      const mockResponse = {
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ url: 'https://blob.url/uploaded.png' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file = new File(['test content'], 'test.png', {
        type: 'image/png',
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/upload/upload-project-icon?filename=test-blob',
          {
            method: 'POST',
            body: file,
          }
        );
      });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          'https://blob.url/uploaded.png'
        );
      });
    });

    it('should not upload when no file is selected', async () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockOnUpload).not.toHaveBeenCalled();
    });

    it('should handle multiple files by taking the first one', async () => {
      const mockResponse = {
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ url: 'https://blob.url/uploaded.png' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/upload/upload-project-icon?filename=test-blob',
          {
            method: 'POST',
            body: file1,
          }
        );
      });
    });
  });

  describe('Drag and Drop Upload', () => {
    it('should handle file drop through dropzone', async () => {
      const mockResponse = {
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ url: 'https://blob.url/dropped.png' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const dropzone = screen.getByTestId('dropzone');
      fireEvent.click(dropzone); // This triggers the mock onDrop

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/upload/upload-project-icon?filename=test-blob',
          {
            method: 'POST',
            body: expect.any(File),
          }
        );
      });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          'https://blob.url/dropped.png'
        );
      });
    });
  });

  describe('Image Click Interaction', () => {
    it('should trigger file input when image is clicked', async () => {
      const user = userEvent.setup();

      // Mock fetch to prevent actual upload attempts
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ url: 'https://blob.url/test.png' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath="/test-image.png"
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');

      // Mock the file input click
      const fileInput = screen.getByTestId('file-input');
      const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation();

      await user.click(image);

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('File Type Validation', () => {
    it('should accept valid image file types', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute(
        'accept',
        'image/png, image/jpeg, image/jpg, image/svg+xml, image/webp, image/gif'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle upload API errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (global.fetch as jest.Mock).mockRejectedValue({
        message: 'Upload failed',
      });

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not call onUpload on error
      expect(mockOnUpload).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle malformed API response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockRejectedValue({ message: 'Invalid JSON' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper tooltip', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      // The tooltip should be rendered with title attribute
      expect(screen.getByTitle('Upload new project icon')).toBeInTheDocument();
    });

    it('should have hidden file input', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveClass('hidden');
    });

    it('should have cursor pointer on image', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveClass('cursor-pointer');
    });
  });

  describe('Styling', () => {
    it('should apply hover effects to icon variant', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveClass('hover:bg-[#ECC94E20]');
      expect(image).toHaveClass('hover:scale-150');
      expect(image).toHaveClass('transition-all');
    });

    it('should apply correct dimensions', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveClass('w-[3rem]');
      expect(image).toHaveClass('h-[3rem]');
    });

    it('should apply rounded corners', () => {
      render(
        <UploadImage
          onUpload={mockOnUpload}
          imagePath={null}
          blobName="test-blob"
        />
      );

      const image = screen.getByAltText('icon');
      expect(image).toHaveClass('rounded-[11.712px]');
    });
  });
});

describe('uploadFile utility function', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should upload file and return URL', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ url: 'https://blob.url/test.png' }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const mockOnUpload = jest.fn();

    const result = await uploadFile(file, 'test-blob', mockOnUpload);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/upload/upload-project-icon?filename=test-blob',
      {
        method: 'POST',
        body: file,
      }
    );

    expect(mockOnUpload).toHaveBeenCalledWith('https://blob.url/test.png');
    expect(result).toBe('https://blob.url/test.png');
  });

  it('should work without onUpload callback', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ url: 'https://blob.url/test.png' }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const file = new File(['test'], 'test.png', { type: 'image/png' });

    const result = await uploadFile(file, 'test-blob');

    expect(result).toBe('https://blob.url/test.png');
  });

  it('should handle upload errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const file = new File(['test'], 'test.png', { type: 'image/png' });

    await expect(uploadFile(file, 'test-blob')).rejects.toThrow(
      'Network error'
    );
  });
});
