describe('Delete pizza', () => {
  beforeEach(() => {
    
    cy.fixture('pizzas').then((pizzas) => {
      cy.intercept({
        method: 'DELETE',
        url: '/api/pizzas/*'
      }, pizzas).as('deletePizza');

      cy.intercept({
        method: 'GET',
        url: '/api/pizzas'
      }, pizzas).as('getPizzas');
    });
    cy.fixture('addTopping').as('addToppingAPI');

    cy.visit('');
  });

  it('should delete a pizza', () => {
    cy.wait(5000);

    cy.get('.pizza-item')
      .contains(`Seaside Surfin'`)
      .within(() => {
        cy.get('.btn.btn__ok').click();
      });

    cy.get('.btn.btn__warning')
      .contains('Delete Pizza')
      .click();

    cy.wait('@deletePizza').its('response.statusCode').should('eq', 200)
  });
});
