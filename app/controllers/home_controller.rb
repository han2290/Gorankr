class HomeController < ApplicationController
  before_action :authenticate_user!
  def index
    @players = Player.all
    @player = Player.find_by_user_id(current_user.id)
  end
  
  def users
    @users=User.all
  end
  
  def imgupdate
    puts "-------짜잔!----------"
    puts params[:avatar]
    puts params[:id]
    puts User.find(params[:id])
    User.find(params[:id]).update(
      avatar: params[:avatar]
    )
    
    redirect_to :back
  end
  private
  def avatar_params
    params.require(:user).permit(:avatar)
  end
end
