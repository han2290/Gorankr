class MypagesController < ApplicationController
    def index
    end
    
    def editprofile
        if params[:avatar].nil?
            current_user.update(username: params[:username])
        else
            current_user.update(username: params[:username], avatar: params[:avatar])
        end
        
        
        
        
        redirect_to :back
    end
end
