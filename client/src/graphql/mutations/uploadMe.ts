import { gql, TypedDocumentNode } from '@apollo/client';

export interface UploadMeResult {
  uploadMe: {
    profile_pic: string;
    profile_pic_url: string;
  };
}

export interface UploadMeVariables {
  upload: {
    profilePic?: File;
  };
}

const UPLOAD_ME: TypedDocumentNode<UploadMeResult, UploadMeVariables> = gql`
  mutation UploadMe($upload: UploadMeInput!) {
    uploadMe(upload: $upload) {
      profile_pic
      profile_pic_url
    }
  }
`;

export default UPLOAD_ME;
