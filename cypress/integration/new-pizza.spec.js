describe('Create pizza', () => {
    beforeEach(() => {
        cy.visit('');
    });

    it('should have the right placeholder', () => {
        cy.get('.products__new a').click();
        cy.get('.pizza-form__input').should('have.value', '');
        cy.get('.pizza-form__input').invoke('attr', 'placeholder').should('be', 'e.g. Pepperoni');
    });

    it('should show an error when pizza has no name ', () => {
        cy.get('.products__new a').click();
        cy.get('.pizza-form__input').focus('');
        cy.get('.pizza-form__input').blur();

        cy.get('.pizza-form__error').should('contain', 'Pizza must have a name');
    });

    it('should create a new pizza correctly', () => {
        cy.get('.products__new a').click();

        cy.get('.pizza-form__input').type('My new pizza');
        cy.get('.pizza-toppings-item').contains('bacon').click();
        cy.get('.pizza-toppings-item').contains('basil').click();
        cy.get('.pizza-toppings-item').contains('tomato').click();

        cy.get('button').contains('Create Pizza').click();

        cy.get('button').contains('Create Pizza').click();

        cy.get('.app__nav a').contains('Products').click();

        cy.get('pizza-item').should('have.length', 4);

        cy.get('pizza-item')
            .contains('My new pizza')
            .within(() => {
                cy.get('button').contains('View pizza').click();
                cy.get('button').contains('Delete Pizza').click();
            });
    });
});
