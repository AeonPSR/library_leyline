describe('Library Articles E2E Tests', () => {
  it('should load the homepage successfully', () => {
    cy.visit('/');
    cy.get('html').should('exist');
  });

  it('should create a new article via API', () => {
    cy.createArticle('E2E Test Article', 'This is content for E2E testing').then((article) => {
      expect(article).to.have.property('id');
      expect(article.title).to.eq('E2E Test Article');
      expect(article.content).to.eq('This is content for E2E testing');
    });
  });

  it('should retrieve all articles via API', () => {
    // Create a couple test articles
    cy.createArticle('First Article', 'First content');
    cy.createArticle('Second Article', 'Second content');

    cy.request('/api/articles').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.articles).to.be.an('array');
      expect(response.body.articles.length).to.be.greaterThan(0);
      expect(response.body.pagination).to.exist;
    });
  });

  it('should retrieve a specific article via API', () => {
    cy.createArticle('Specific Test Article', 'Specific content').then((article) => {
      cy.request(`/api/articles/${article.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.eq('Specific Test Article');
        expect(response.body.content).to.eq('Specific content');
        expect(response.body.id).to.eq(article.id);
      });
    });
  });

  it('should update an article via API', () => {
    cy.createArticle('Original Article', 'Original content').then((article) => {
      cy.request('PUT', `/api/articles/${article.id}`, {
        title: 'Updated Article',
        content: 'Updated content',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.eq('Updated Article');
        expect(response.body.content).to.eq('Updated content');
        expect(response.body.version).to.eq(2);
      });
    });
  });

  it('should delete an article via API', () => {
    cy.createArticle('Article to Delete', 'Will be deleted').then((article) => {
      // Delete the article
      cy.request('DELETE', `/api/articles/${article.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include('deleted successfully');
      });

      // Verify it's gone
      cy.request({
        url: `/api/articles/${article.id}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
