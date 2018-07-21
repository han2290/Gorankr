class Player < ApplicationRecord
    serialize :game_data
    belongs_to :user
    belongs_to :category
end
