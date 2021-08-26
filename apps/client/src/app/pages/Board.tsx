import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { Box, Flex, Grid, Heading, Icon, Spacer, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import api from '../api'
import Layout from '../components/Layout'

const useBoard = (id: string) => {
  return useQuery(['board', id], () => api.fetchBoard(id), { enabled: id != null })
}

const useUpdateBoard = () => {
  return useMutation(api.addColumn)
}

const useDeleteColumn = () => {
  return useMutation(api.deleteColumn)
}


// pass the id for the board
// get the columns & map to build out the columns
const Board = () => {
  const {id} = useParams<{id: string}>()
  const { data, isLoading, refetch } = useBoard(id)
  const { mutateAsync: addColumnAsync } = useUpdateBoard()
  const { mutateAsync: deleteColumnAsync } = useDeleteColumn()
 
  if(isLoading) return <Spinner />

  const addColumn = async () => {
    await addColumnAsync({ boardId: id, title: 'TITLE'})
    await refetch()
  }

  const deleteColumn = async (columnId: string) => {
    await deleteColumnAsync({ columnId })
    await refetch()
  }

  return (
    <Box>
      <Box p={10}>
        <Heading as="h1" size="lg">
          {data?.title}
        </Heading>

        <AddIcon onClick={addColumn} />
      </Box>    
      <Grid templateColumns={`repeat(${data?.Category.length}, 1fr)`}>
        {data?.Category.map(category => (
          <Box key={category.id} w="100%" h="100vh" borderWidth="1px" p={10}>
            <Flex>
              <Heading as="h2" size="md">
                {category.title}
              </Heading>
              <Spacer />
              <DeleteIcon w={6} h={6} onClick={() => deleteColumn(category.id)} />
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  )
}

export default Board
