Rails.application.routes.draw do
  devise_for :users
  
  root 'home#index'
  
  # mypage
  get '/mypage'                   =>  'mypages#index'
  patch '/mypage/editprofile'     =>  'mypages#editprofile'
  
  # match
  get '/match'                    =>  'matchs#index'
  
  #post
  post '/uploads'                 => 'posts#upload_image'
  
  get '/boards/:id/edit'          => 'posts#edit', as: 'edit_post'
  
  get '/boards/:game_name'        => 'posts#index' #categories#show
  
  get '/boards/:game_name/new'    => 'posts#new', as: 'new_post'
  post '/boards/:game_name'       => 'posts#create', as: 'posts'
  
  get '/boards/:game_name/:id'    => 'posts#show', as: 'post'
  patch '/boards/:game_name/:id'  => 'posts#update', as: 'post_update'
  delete '/boards/:game_name/:id' => 'posts#destroy'
  
  # test
  get '/users'                    =>  'home#users'
  
  patch '/users/:id/image'    => 'home#imgupdate'
  
  
   
end
