import '@4tw/cypress-drag-drop';

describe('client', () => {
  beforeEach(() => cy.visit('/'));

  it('will create a board', () => {
    cy.login('test-user-1@example.com');
    cy.contains('Create a new Board');

    const boardTitle = 'New Board Title';
    const columns = ['bad', 'good', 'better', 'worse'];

    // Fill out the board name
    cy.contains('Board Title');
    cy.getBySel('board_title')
      .type(boardTitle)
      .should('have.value', boardTitle);

    // Fill out the column names
    cy.contains('Columns');
    cy.getBySel('column_names')
      .clear()
      .type(columns.join(', '))
      .should('have.value', columns.join(', '));

    // Click the create board button
    cy.getBySel('create_board_button').click();

    cy.url().should('match', /boards\/.*/);

    cy.contains(boardTitle);
    for (const column of columns) {
      cy.contains(column);
    }
  });

  it('will add a card to a column', () => {
    cy.login('test-user-1@example.com');
    cy.newBoard();

    cy.getBySel('column-input-0').type('This is some new card info{enter}');

    cy.getBySel('card-list-0').children().should('have.length', 1);

    cy.getBySel('column-input-0').type(
      'This is a second card with info{enter}',
    );

    cy.getBySel('card-list-0').children().should('have.length', 2);
  });

  it('Accepts voting input', () => {
    cy.login('test-user-1@example.com');
    cy.newBoard();

    cy.getBySel('column-input-0').type('This is some new card info{enter}');

    cy.getBySel('card-list-0').children().should('have.length', 1);

    cy.getBySel('vote-count-0').contains(0);

    cy.getBySel('upvote-button-0').click();
    cy.getBySel('vote-count-0').contains(1);
    cy.getBySel('downvote-button-0').click();
    cy.getBySel('vote-count-0').contains(0);
  });

  it.only('will add and remove columns', () => {
    cy.login('test-user-1@example.com');
    cy.newBoard();

    const columnName = 'new_column_name';

    // Open modal
    cy.getBySel('add_column_button').click();
    // Fill out form
    cy.getBySel('column_name_field').type(columnName);
    cy.getBySel('save_column').click();
    // Assert column exists
    cy.contains(columnName);
    // Delete column
    cy.getBySel('delete-column-0-button').click();
    cy.getBySel('confirm_yes').click();
    // Assert column is gone
    cy.contains(columnName).should('not.exist');
  });
});
