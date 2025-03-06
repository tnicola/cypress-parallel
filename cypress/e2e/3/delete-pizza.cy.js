describe('Delete pizza', () => {
  beforeEach(() => {
    cy.fixture('pizzas').as('pizzasAPI');
    cy.fixture('addTopping').as('addToppingAPI');
    cy.intercept('DELETE', '/api/pizzas/*', {}).as('deletePizza');
    cy.intercept('GET', '/api/pizzas', { fixture: 'pizzas' }).as('getPizzas');

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

    cy.wait('@deletePizza').should(interception => {
      expect(interception.response.statusCode).to.equal(200);
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

      cy.wait('@deletePizza').should(interception => {
        expect(interception.response.statusCode).to.equal(200);
      });
    });
  })
});
