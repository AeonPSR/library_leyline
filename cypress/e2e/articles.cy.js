describe('Library Articles E2E Tests', () => {
  beforeEach(() => {
    // Clean up before each test
    cy.deleteAllArticles();
  });

  it('should access the homepage', () => {
    cy.visit('/');
    // Just verify the page loads without errors
    cy.get('html').should('exist');
  });

  it('should create a new article via API', () => {
    cy.createArticle('E2E Test Article', 'This is an E2E test article').then((article) => {
      // Verify article was created
      expect(article).to.have.property('id');
      expect(article.title).to.eq('E2E Test Article');
      expect(article.content).to.eq('This is an E2E test article');
      expect(article._id).to.eq(article.id);
    });
  });

  it('should retrieve all articles via API', () => {
    // Create test articles
    cy.createArticle('First Article', 'Content one');
    cy.createArticle('Second Article', 'Content two');

    // Get all articles
    cy.request('/api/articles').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.articles).to.have.length.greaterThan(1);
      expect(response.body.pagination).to.exist;
    });
  });

  it('should retrieve a specific article via API', () => {
    cy.createArticle('Specific Article', 'Specific content').then((article) => {
      cy.request(`/api/articles/${article.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.eq('Specific Article');
        expect(response.body.content).to.eq('Specific content');
      });
    });
  });

  it('should update an article via API', () => {
    cy.createArticle('Original Title', 'Original content').then((article) => {
      cy.request('PUT', `/api/articles/${article.id}`, {
        title: 'Updated Title',
        content: 'Updated content',
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.title).to.eq('Updated Title');
        expect(response.body.content).to.eq('Updated content');
        expect(response.body.version).to.eq(2);
      });
    });
  });

  it('should delete an article via API', () => {
    cy.createArticle('Article to Delete', 'Will be deleted').then((article) => {
      cy.request('DELETE', `/api/articles/${article.id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.message).to.include('deleted successfully');
      });
      
      // Verify it's deleted
      cy.request({
        url: `/api/articles/${article.id}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });
});
