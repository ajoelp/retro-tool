import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { Box, Flex, Grid, Heading, Icon, Spacer, Spinner } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import api from '../../api'
import {useDialogs} from "../../dialog-manager";
import styled from "styled-components";
import {Navigation} from "../../components/Navigation";
import {NavHeight} from "../../theme/sizes";
import Column from "../../components/Column";
import {useBoard} from "../../hooks/boards";
import {useColumns, useDeleteColumn, useUpdateBoard} from "../../hooks/columns";
import {useBoardEvents} from "../../hooks/useBoardEvents";
import { Prisma } from '@prisma/client'

const Wrapper = styled.div`
  height: calc(100vh - ${NavHeight}px);
  display: flex;
  width: 100vw;
  flex-wrap: nowrap;
`

const Board = () => {
  const {id} = useParams<{id: string}>()
  const { data, isLoading } = useBoard(id)
  const { columns, columnsLoading } = useColumns(id)
  const { mutateAsync: addColumnAsync } = useUpdateBoard()

  useBoardEvents(id)

  const { openDialog } = useDialogs()

  if(isLoading) return <Spinner />
  if(!data) return null

  const columnOrder = data?.columnOrder as string[] ?? []

  return (
    <>
      <Navigation board={data} />
      <Wrapper>
        {columnOrder.map(columnId => {
          const column = columns?.find(column => column.id === columnId)
          if(!column) return null
          return <Column column={column} board={data} key={column.id} />
        })}
      </Wrapper>
    </>
  )
}

export default Board
