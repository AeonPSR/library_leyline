// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

Cypress.Commands.add('createArticle', (title, content) => {
  cy.request('POST', '/api/articles', {
    title,
    content,
    summary: 'Test summary',
    tags: ['test'],
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

Cypress.Commands.add('deleteAllArticles', () => {
  cy.request('/api/articles').then((response) => {
    const articles = response.body.articles;
    articles.forEach((article) => {
      cy.request({
        method: 'DELETE',
        url: `/api/articles/${article.id}`,
        failOnStatusCode: false, // Don't fail if already deleted
      });
    });
  });
});
