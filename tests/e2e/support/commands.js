// ***********************************************
// Custom commands for Cypress E2E tests
// ***********************************************

Cypress.Commands.add('createArticle', (title, content, tags = ['test']) => {
  return cy.request('POST', '/api/articles', {
    title,
    content,
    summary: 'Test summary',
    tags,
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

Cypress.Commands.add('deleteAllArticles', () => {
  return cy.request('/api/articles').then((response) => {
    const articles = response.body.articles || [];
    articles.forEach((article) => {
      cy.request({
        method: 'DELETE',
        url: `/api/articles/${article.id}`,
        failOnStatusCode: false,
      });
    });
  });
});
