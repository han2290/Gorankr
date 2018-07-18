Rails.application.routes.draw do
  devise_for :users
  resources :boards
  
  root 'home#index'
  
  # mypage
  get '/mypage'               =>  'mypages#index'
  patch '/mypage/editprofile' =>  'mypages#editprofile'
  
  get '/match'                =>  'matchs#index'
  
  
  # test
  get '/users'                =>  'home#users'
  
  patch '/users/:id/image'    => 'home#imgupdate'
  
  
   
end
