import {Board, Column as ColumnType} from "@prisma/client";
import styled from "styled-components";
import {Heading} from "@chakra-ui/react";
import {BorderRadius, NavHeight} from "../../theme/sizes";
import {backgroundColor} from "../../theme/colors";
import {useBoard} from "../../hooks/boards";
import {BoardWithColumn} from "../../api";
import {useDialogs} from "../../dialog-manager";
import {useDeleteColumn} from "../../hooks/columns";
import {DeleteIcon} from "@chakra-ui/icons";
import {useCards, useCreateCard} from "../../hooks/cards";
import {useRef} from "react";
import {Card} from "../Card";

const Wrapper = styled.div`
  padding: 40px;
  width: 25vw;
  height: calc(100vh - ${NavHeight}px);
`

const CardsContainer = styled.div`
  background-color: ${backgroundColor};
  height: 100%;
  margin: 20px 0;
  border-radius: ${BorderRadius}px;
  display: flex;
  padding: 10px;
  flex-wrap: wrap;
  align-items: flex-start;
`

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`
const AddCardContainer = styled.form`
  margin-top: auto;
  background-color: ${backgroundColor};
  border-radius: ${BorderRadius}px;
`

const AddCardInput = styled.textarea`
  width: 100%;
  height: 200px;
  resize: none;
  background-color: transparent;
  padding: 10px;
  display: flex;
  &:focus {
    outline: none;
    border: 1px solid blue;
    border-radius: ${BorderRadius}px;
  }
`

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

type ColumnProps = {
  column: ColumnType
  board: Board
}

export default function Column({ column, board }: ColumnProps) {
  const { mutateAsync: deleteColumnAsync } = useDeleteColumn()
  const { openDialog } = useDialogs()
  const { refetch } = useBoard(board.id)
  const { cards } = useCards(column.id)
  const { createCard } = useCreateCard(column.id)
  const newCardRef = useRef<HTMLTextAreaElement>(null)

  const submitCard = async (event: any) => {
    event.preventDefault()
    if(!newCardRef.current) return

    await createCard({
      content: newCardRef.current.value ?? ''
    })

    newCardRef.current.value = ''
  }


  const deleteColumn = async (columnId: string) => {
    openDialog('confirmation', {
      title: 'Are you sure?',
      message: 'Are you sure you want to delete the column?',
      onSuccess: async () => {
        await deleteColumnAsync({ columnId })
        await refetch()
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel: () => {}
    })

  }
  return (
    <Wrapper>
      <HeadingContainer>
        <Heading size="md">{column.title}</Heading>
        <button onClick={() => deleteColumn(column.id)}>
          <DeleteIcon />
        </button>
      </HeadingContainer>

      <Container>
        <CardsContainer>
          {cards?.map(card => (
            <Card key={card.id}>
              <p>{card.content}</p>
            </Card>
          ))}
        </CardsContainer>
        <AddCardContainer onSubmit={submitCard}>
          <AddCardInput ref={newCardRef} placeholder="New item" />
          <button type="submit">Send</button>
        </AddCardContainer>
      </Container>
    </Wrapper>
  )
}


