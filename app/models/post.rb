class Post < ApplicationRecord
    is_impressionable :counter_cache => true
    paginates_per 8
    belongs_to :user # 하나의 유저에 속한다.
    belongs_to :category # 하나의 카테고리에 속한다.
    
    has_many :comments # 여러개의 코멘트를 갖는다.
    
    
    has_many :likes # 여러 개의 좋아요를 가진다.
    # has_many :users, through: :likes # 좋아요를 통해 많은 수의 유저를 가진다.
    
    def format_time
        time_diff = Time.now - self.created_at
        if time_diff < 60
            return time_diff.round.to_s + " 초 전"
        elsif time_diff < 3600
            return (time_diff/60).round.to_s + " 분 전"
        elsif time_diff < 86400
            return (time_diff/3600).round.to_s + " 시간 전"
        else
            return self.created_at.strftime("%Y-%m-%d")
        end
    end
    
end
