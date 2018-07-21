class Post < ApplicationRecord
    is_impressionable :counter_cache => true
    
    belongs_to :user # 하나의 유저에 속한다.
    belongs_to :category # 하나의 카테고리에 속한다.
    
    has_many :comments # 여러개의 코멘트를 갖는다.
    
    
    has_many :likes # 여러 개의 좋아요를 가진다.
    # has_many :users, through: :likes # 좋아요를 통해 많은 수의 유저를 가진다.
end
