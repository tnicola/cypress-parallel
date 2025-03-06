describe('Modify pizza', () => {
  beforeEach(() => {
    cy.fixture('pizzas').as('pizzasAPI');
    cy.fixture('addTopping').as('addToppingAPI');
    cy.intercept('PUT', '/api/pizzas/*').as('addToppingRequest');
    cy.intercept('GET', '/api/pizzas', { fixture: 'pizzas' }).as('getPizzas');

    cy.visit('');
  });

  it('should remove a topping', () => {
    cy.wait('@getPizzas');

    cy.get('.pizza-item')
      .contains(`Seaside Surfin'`)
      .within(() => {
        cy.get('.btn.btn__ok').click();
      });
    cy.get('.pizza-toppings-item')
      .contains('bacon')
      .click();
    cy.get('.btn.btn__ok')
      .contains('Save changes')
      .click();

    cy.wait('@addToppingRequest')
      .then(interception => {
        expect(interception.request.body.toppings).to.deep.equal([
          { id: 6, name: 'mushroom' },
          { id: 7, name: 'olive' },
          { id: 3, name: 'basil' },
          { id: 1, name: 'anchovy' },
          { id: 8, name: 'onion' },
          { id: 11, name: 'sweetcorn' },
          { id: 9, name: 'pepper' },
          { id: 5, name: 'mozzarella' }
        ]);
      });
  });

  it('should add a topping', () => {
    cy.get('.pizza-item')
      .contains(`Plain Ol' Pepperoni`)
      .within(() => {
        cy.get('.btn.btn__ok').click();
      });
    cy.get('.pizza-toppings-item')
      .contains('mushroom')
      .click();
    cy.get('.btn.btn__ok')
      .contains('Save changes')
      .click();

    cy.wait('@addToppingRequest')
      .then(interception => {
        expect(interception.request.body.toppings).to.deep.equal([
          { id: 10, name: 'pepperoni' },
          { id: 6, name: 'mushroom' }
        ]);
      });
  });

  it('can remove and add the same topping', () => {
    cy.get('.pizza-item')
      .contains(`Plain Ol' Pepperoni`)
      .within(() => {
        cy.get('.btn.btn__ok').click();
      });
    cy.get('.pizza-toppings-item')
      .contains('pepperoni')
      .click();
    cy.get('.pizza-toppings-item')
      .contains('pepperoni')
      .click();
    cy.get('.btn.btn__ok')
      .contains('Save changes')
      .click();

    cy.wait('@addToppingRequest')
      .then(interception => {
        expect(interception.request.body.toppings).to.deep.equal([
          { id: 10, name: 'pepperoni' },
        ]);
      });
  });
});
