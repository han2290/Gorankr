class User < ApplicationRecord
  mount_uploader :avatar, AvatarUploader
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  validates :username, uniqueness: true  
  
  # 하나의 유저는 많은 댓글을 가짐
  has_many :comments
  
  # 하나의 유저는 여러 개의 개시글들을 가짐
  has_many :posts
  
  # 하나의 유저는 여러 좋아요를 가짐
  has_many :likes
  # has_many :posts, through: :likes #이 좋아요를 통해 post와 관계를 가짐
  
  
  has_many :usersgames
  # 하나의 유저는 여러 추천을 가짐
  # has_many :recomend
  # has_many :users, through: :recommend
end
