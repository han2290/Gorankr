Rails.application.routes.draw do
  devise_for :users
  
  root 'home#index'
  
  # mypage
  get '/mypage'                   =>  'mypages#index'
  patch '/mypage/editprofile'     =>  'mypages#editprofile'
  
  post 'mypage/game'                =>  'mypages#add_game'
  delete 'mypage/game/:usersgameid' =>  'mypages#destroy_game'
  
  # match
  get '/match'                    =>  'matchs#index'
  
  # post like
  get '/likes/:post_id' => 'posts#like_post'
  
  #post
  post '/uploads'                 => 'posts#upload_image'
  
  get '/boards/:id/edit'          => 'posts#edit', as: 'edit_post'
  
  get '/boards/:game_name'        => 'posts#index' #categories#show
  
  get '/boards/:game_name/new'    => 'posts#new', as: 'new_post'
  post '/boards/:game_name'       => 'posts#create', as: 'posts'
  
  get '/boards/:game_name/:id'    => 'posts#show', as: 'post'
  patch '/boards/:game_name/:id'  => 'posts#update', as: 'post_update'
  delete '/boards/:game_name/:id' => 'posts#destroy'
  
  
  # Routing for board comments
  post '/posts/:id/comments' => 'posts#create_comment'
  delete '/posts/comments/:comment_id' => 'posts#destroy_comment'
  patch '/posts/comments/:comment_id' => 'posts#update_comment'
  
  # 데이터 가져오기
  get '/fetch/:category' => 'mypages#fetch_data'
  
  

  
  
  # test
  get '/users'                    =>  'home#users'
  
  patch '/users/:id/image'    => 'home#imgupdate'
  
  
   
end
