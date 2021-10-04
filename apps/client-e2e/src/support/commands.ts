// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(email: string): void;
    newBoard(boardName?: string, columns?: string[]): void
    getBySel(selector: string, ...args: any): Chainable<Element>;
  }
}

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-testid=${selector}]`, ...args)
})

// -- This is a parent command --
Cypress.Commands.add('login', (email) => {
  cy.request("POST", "http://localhost:3333/auth/mock", { email }).as('userLoad').then(response => {
    expect(response).to.have.property('body')
    cy.setCookie('auth_token', `Bearer ${response.body.token}`)
    cy.reload()
  })
});


Cypress.Commands.add('newBoard', (boardName = "New Board", columns = ['good', 'bad', 'worse']) => {
  cy.getCookie('auth_token').then(token => {
    cy.request({
      url: "http://localhost:3333/boards",
      method: 'POST',
      body: { title: boardName, columns },
      headers: {
        'Authorization': token.value
      }
    }).then(response => {
      expect(response).to.have.property('body')
      cy.visit(`/boards/${response.body?.board?.id}`)
    })
  })
})


//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
