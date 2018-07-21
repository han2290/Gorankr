Rails.application.routes.draw do
  devise_for :users
  
  root 'home#index'
  
  # mypage
  get '/mypage'                   =>  'mypages#index'
  patch '/mypage/editprofile'     =>  'mypages#editprofile'
  
  post 'mypage/game'                =>  'mypages#add_game'
  delete 'mypage/game/:usersgameid' =>  'mypages#destroy_game'
  
  # Chat
  post '/chat_rooms/:id/join' => "chat_rooms#user_admit_room", as: 'join_chat_room'
  post '/chat_rooms/:id/chat' => "chat_rooms#chat", as: "chat_chat_room"
  delete '/chat_rooms/:id/exit' => "chat_rooms#user_exit_room", as: "exit_chat_room"
  get '/chat_rooms' => "chat_rooms#index", as: 'chat_rooms'
  post '/chat_rooms' => 'chat_rooms#create'
  get '/chat_rooms/new' => 'chat_rooms#new', as: 'new_chat_room'
  get '/chat_rooms/:id/edit' => 'chat_rooms#edit', as: 'edit_chat_room'
  get '/chat_rooms/:id' => 'chat_rooms#show', as: 'chat_room'
  delete '/chat_rooms/:id' => 'chat_rooms#destroy'
  
  
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
  
  # Queue matching routes
  post '/players' => 'players#create'
  patch '/players/update' => 'players#update'
  post '/queue/lol_duo' => 'players#duo_match'
  post '/queue/lol_squad' => 'players#team_match_lol'
  post '/queue/pubg_duo' => 'players#duo_match'
  post '/queue/pubg_squad' => 'players#team_match_pubg'
  post '/queue/ow_duo' => 'players#duo_match'
  post '/queue/link' => 'players#link_players'
  
  # Pusher authentication for presence channel
  post '/pusher/auth' => 'pusher#auth'

  
  
  # test
  get '/users'                    =>  'home#users'
  
  patch '/users/:id/image'    => 'home#imgupdate'
  
  
   
end
