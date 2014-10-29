# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
match '/projects/:project_id/wiki/:id', :to => 'wiki#show', :via => [:get, :post]
