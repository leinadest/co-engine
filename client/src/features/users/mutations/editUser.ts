import { gql, TypedDocumentNode } from '@apollo/client';

export interface EditMeResult {
  editUser: boolean;
}

export interface EditMeVariables {
  edit: {
    username?: string;
    email?: string;
    profilePic?: string;
  };
}

const EDIT_ME: TypedDocumentNode<EditMeResult, EditMeVariables> = gql`
  mutation EditMe($edit: EditMeInput!) {
    editMe(edit: $edit)
  }
`;

export default EDIT_ME;
