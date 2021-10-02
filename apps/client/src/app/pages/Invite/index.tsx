import { Spinner } from '@chakra-ui/spinner';
import { Alert, AlertIcon, AlertTitle } from '@chakra-ui/alert';
import { Redirect, useParams } from 'react-router';
import { useInvite } from '../../hooks/invites';
import { CloseButton } from '@chakra-ui/close-button';

type InviteParamsType = {
  inviteCode: string;
};

const Invite = () => {
  const { inviteCode } = useParams<InviteParamsType>();

  const { isLoading, isSuccess, data } = useInvite(inviteCode);

  if (isLoading) return <Spinner />;

  if (isSuccess) {
    return <Redirect to={`/boards/${data?.id}`} />;
  }

  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle mr={2}>Invite code not found!</AlertTitle>
    </Alert>
  );
};

export default Invite;
