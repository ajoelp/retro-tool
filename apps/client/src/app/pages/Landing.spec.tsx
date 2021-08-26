import React from "react";
import { screen, render } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import Landing from "./Landing";
import api from "../api";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

jest.mock('../api')

const queryClient = new QueryClient();

const renderComponent = () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </QueryClientProvider>
  )
}


describe('Landing Page', () => {

  beforeEach( () => {
    api.createBoard = jest.fn().mockResolvedValue({ data: { board: { }}})
  })

  it('handles form submit', () => {
    renderComponent()
    const boardColumns = ['first', 'second']
    const boardInput = screen.getByRole('textbox', {name: 'Board Title'})

    const boardTitle = 'My Test Board'
    userEvent.type(boardInput, boardTitle)

    const columnInput = screen.getByRole('textbox', {name: 'Column Name'})
    userEvent.type(columnInput, boardColumns.join(','))
    userEvent.click(screen.getByRole('button', {name: 'Create Board'}))


    expect(api.createBoard).toBeCalledWith({title: boardTitle, columns: boardColumns })
    // expect that we're rerouted?
    
  })
})
