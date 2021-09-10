describe('Pizza', () => {
    beforeEach(() => {
        cy.server();
        cy.fixture('pizzas').as('pizzasAPI');
        cy.route({
          method: 'GET',
          status: 200,
          url: '/api/pizzas',
          response: '@pizzasAPI'
        }).as('getPizzas');

        cy.visit('');
    });

    it('should navigate to products when products button is clicked', () => {
        cy.wait(5000);

        cy.get('.app__nav a').contains('Products').click();
        cy.url().should('include', 'products');

        cy.get('.products__new a').click();

        cy.get('.app__nav a').contains('Products').click();
        cy.url().should('include', 'products');
    });

    it('should load all pizzas', () => {
        cy.get('pizza-item').should('have.length', 3);
    });

    it('should open each pizza with proper ingredients', () => {
        cy.get('pizza-item button').first().should('contain', 'View Pizza').click();

        cy.get('.pizza-form__input').should('have.value', "Blazin' Inferno");
    });
});
