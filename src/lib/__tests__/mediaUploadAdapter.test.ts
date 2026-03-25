import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeMediaUpload } from '../mediaUploadAdapter';
import type { ImageUploadInstruction } from '@/services/types/media';

// Mock global fetch
globalThis.fetch = vi.fn();

describe('mediaUploadAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes to Cloudinary-style Multipart FormData when fields are present', async () => {
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const mockInstruction: ImageUploadInstruction = {
      provider: 'cloudinary',
      uploadUrl: 'https://api.cloudinary.com/v1_1/demo/image/upload',
      method: 'POST',
      fields: {
        api_key: '12345',
        signature: 'abcdef',
        timestamp: '11111'
      },
      objectKey: 'users/123/avatar.png'
    };

    // Simulate successful fetch response
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/users/123/avatar.png',
        etag: 'test-etag'
      })
    });

    const result = await executeMediaUpload(mockFile, mockInstruction);

    // Assert fetch was called correctly
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, config] = (globalThis.fetch as any).mock.calls[0];
    
    expect(url).toBe(mockInstruction.uploadUrl);
    expect(config.method).toBe('POST');
    expect(config.body).toBeInstanceOf(FormData);

    // Verify properties
    const formData = config.body as FormData;
    expect(formData.get('api_key')).toBe('12345');
    expect(formData.get('file')).toBeInstanceOf(File);

    // Verify result mapping
    expect(result.secureUrl).toBe('https://res.cloudinary.com/demo/image/upload/v1/users/123/avatar.png');
    expect(result.etag).toBe('test-etag');
    expect(result.objectKey).toBe('users/123/avatar.png');
  });

  it('routes to S3-style Signed PUT when fields are missing and headers exist', async () => {
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const mockInstruction: ImageUploadInstruction = {
      provider: 's3',
      uploadUrl: 'https://s3.amazonaws.com/bucket/users/123/avatar.png?Signature=XYZ',
      method: 'PUT',
      headers: {
        'x-amz-acl': 'public-read'
      },
      objectKey: 'users/123/avatar.png'
    };

    // Simulate successful fetch response
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'Etag': '"s3-etag-123"' }),
      text: async () => ''
    });

    const result = await executeMediaUpload(mockFile, mockInstruction);

    // Assert fetch was called correctly
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, config] = (globalThis.fetch as any).mock.calls[0];
    
    expect(url).toBe(mockInstruction.uploadUrl);
    expect(config.method).toBe('PUT');
    expect(config.body).toBe(mockFile); // Raw binary body
    expect(config.headers['Content-Type']).toBe('image/png');
    expect(config.headers['x-amz-acl']).toBe('public-read');

    // Verify result mapping
    expect(result.secureUrl).toBe('https://s3.amazonaws.com/bucket/users/123/avatar.png');
    expect(result.etag).toBe('"s3-etag-123"');
    expect(result.objectKey).toBe('users/123/avatar.png');
  });

  it('throws an error if the upload response is not ok', async () => {
    const mockFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const mockInstruction: ImageUploadInstruction = {
      provider: 's3',
      uploadUrl: 'https://s3.amazonaws.com/bucket/fail',
      method: 'PUT',
      objectKey: 'fail.png'
    };

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Signature Does Not Match'
    });

    await expect(executeMediaUpload(mockFile, mockInstruction))
      .rejects
      .toThrow('Binary Upload failed: 403 - Signature Does Not Match');
  });
});
