describe('Modify pizza', () => {
  beforeEach(() => {
    cy.fixture('pizzas').then((pizzas) => {  
      cy.intercept({
        method: 'GET',
        url: '/api/pizzas'}, pizzas).as('getPizzas');
    });

    cy.fixture('addTopping').as('addToppingAPI');

    cy.intercept({
      method: 'PUT',
      url: '/api/pizzas/*'
    }).as('addTopping');

    cy.visit('');
  });

  it('should remove a topping', () => {
    cy.wait(5000);

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

    cy.wait('@addTopping')
      .its('request.body')
      .then(res => {
        expect(res.toppings).to.deep.equal([
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

    cy.wait('@addTopping')
      .its('request.body')
      .then(res => {
        expect(res.toppings).to.deep.equal([
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

    cy.wait('@addTopping')
      .its('response.body')
      .then(res => {
        expect(res.toppings).to.deep.equal([
          { id: 10, name: 'pepperoni' },
        ]);
      });
  });
});
