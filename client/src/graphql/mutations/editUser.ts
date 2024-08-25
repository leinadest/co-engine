import { gql, TypedDocumentNode } from '@apollo/client';

export interface EditMeResult {
  editMe: {
    email: string;
    username: string;
    discriminator: string;
    profile_pic: string;
    profile_pic_url: string;
    bio: string;
  };
}

export interface EditMeVariables {
  edit: {
    username?: string;
    email?: string;
    profilePic?: File;
    bio?: string;
  };
}

const EDIT_ME: TypedDocumentNode<EditMeResult, EditMeVariables> = gql`
  mutation EditMe($edit: EditMeInput!) {
    editMe(edit: $edit) {
      email
      username
      discriminator
      profile_pic
      profile_pic_url
      bio
    }
  }
`;

export default EDIT_ME;
