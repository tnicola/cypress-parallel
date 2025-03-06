describe('Delete pizza', () => {
  beforeEach(() => {
    cy.server();
    cy.fixture('pizzas').as('pizzasAPI');
    cy.fixture('addTopping').as('addToppingAPI');
    cy.route({
      method: 'DELETE',
      url: '/api/pizzas/*',
      response: {}
    }).as('deletePizza');
    cy.route({
      method: 'GET',
      status: 200,
      url: '/api/pizzas',
      response: '@pizzasAPI'
    }).as('getPizzas');

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

    cy.wait('@deletePizza').should(res => {
      expect(res.status).to.equal(200);
    });
  });

  describe('Nested pizza deletion', () => {
    it('should delete a nested pizza', () => {
      cy.wait(5000);
      cy.get('.pizza-item')
        .contains(`Seaside Surfin'`)
        .within(() => {
          cy.get('.btn.btn__ok').click();
        });

      cy.get('.btn.btn__warning')
        .contains('Delete Pizza')
        .click();

      cy.wait('@deletePizza').should(res => {
        expect(res.status).to.equal(200);
      });
    });
  })
});
