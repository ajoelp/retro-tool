import { Spinner } from '@chakra-ui/spinner';
import { Alert, AlertIcon, AlertTitle } from '@chakra-ui/alert';
import { Navigate, useParams } from 'react-router-dom';
import { useInvite } from '../../hooks/invites';

const Invite = () => {
  const { inviteCode } = useParams();

  const { isLoading, isSuccess, data } = useInvite(inviteCode);

  if (isLoading) return <Spinner />;

  if (isSuccess) {
    return <Navigate to={`/boards/${data?.id}`} />;
  }

  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle mr={2}>Invite code not found!</AlertTitle>
    </Alert>
  );
};

export default Invite;
