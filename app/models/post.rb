class Post < ApplicationRecord
    # belongs_to :user
    belongs_to :category 
    
    has_many :comments
    
    has_many :likes
    has_many :users, through: :likes
end
