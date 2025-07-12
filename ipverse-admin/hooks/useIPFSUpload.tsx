/** @format */

import { useState } from 'react';
import { PinataFileManager } from '@/lib/ipfs';
import toast from 'react-hot-toast';

interface CompanyMetadata {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  description:string;
}

interface ProjectMetadata {
  name: string;
  description: string;
  property_type_id: number;
  stage: string;
  ownership_model: string;
  share_type: string;
  featured_video_type: string;
  step_completed: number;
  stage_of_production: string;
  percentage_of_ip: string;
  total_expected_investment: string;
  expected_monetisation_after_ip_right: string;
  proposed_irr: string;
  proposed_money_multipl: string;
  lock_in_period: string;
  other_term: string;
  feature_image: string;
  media_type: string;
  media_value: string;

}

const useIPFSUpload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pinataManager = new PinataFileManager();

  const uploadCompanyFiles = async (
    metadata: CompanyMetadata
  ): Promise<{ [key: string]: string }> => {
    setLoading(true);
    setError(null);
    const fileUrls: { [key: string]: string } = {};

    try {
      // Upload company metadata to IPFS
      const metadataCID = await pinataManager.uploadJSON(metadata, 'public', {
        name: `${metadata.name}-metadata`,
        keyvalues: {
          type: 'company_metadata',
          company_name: metadata.name,
        },
      });

      // Return the metadata CID (no file uploads)
      fileUrls['metadata'] = metadataCID; // Store metadata CID instead of file URLs

      return fileUrls;
    } catch (err: any) {
      const errorMessage =
        err.message || 'An error occurred while uploading metadata to IPFS';
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };


  const uploadProjectFiles = async (
    metadata: ProjectMetadata
  ): Promise<{ [key: string]: string }> => {
    setLoading(true);
    setError(null);
    const fileUrls: { [key: string]: string } = {};

    try {
      // Upload company metadata to IPFS
      const metadataCID = await pinataManager.uploadJSON(metadata, 'public', {
        name: `${metadata.name}-metadata`,
        keyvalues: {
          type: 'project_metadata',
          project_name: metadata.name,
        },
      });

      // Return the metadata CID (no file uploads)
      fileUrls['metadata'] = metadataCID; // Store metadata CID instead of file URLs

      return fileUrls;
    } catch (err: any) {
      const errorMessage =
        err.message || 'An error occurred while uploading metadata to IPFS';
      toast.error(errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  


  return { uploadCompanyFiles,uploadProjectFiles, loading, error };
};

export default useIPFSUpload;