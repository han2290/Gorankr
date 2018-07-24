class ChatRoomsController < ApplicationController
    before_action :set_chat_room, only: [:show, :edit, :update, :destroy, :chat, :user_admit_room, :user_exit_room]
  
  # GET /chat_rooms
  # GET /chat_rooms.json
  def index
    @chat_rooms = ChatRoom.all
    
    # 카테고리로 어느 데이터를 가져올지 정하고
    # 현재 채팅방의 유저들을 각각 하나씩 가져와서
    # 메소드에 아이디와 카테고리를 넘겨 결과값을 반환받는다.
    # 그 값을 아이디와 병합하여 배열로 다시 만든다.
    
  end

  # GET /chat_rooms/1
  # GET /chat_rooms/1.json
  def show
    # 카테고리로 어느 데이터를 가져올지 정하고
    # 현재 채팅방의 유저들을 각각 하나씩 가져와서
    # 메소드에 아이디와 카테고리를 넘겨 결과값을 반환받는다.
    # 그 값을 아이디와 병합하여 배열로 다시 만든다.
    @user_data = []
    
    @chat_room.admissions.each do |admission|
      game_id = admission.user.usersgames.find_by_category_id(@chat_room.category_id).user_nickname
      @user_data.push({user_id: admission.user.id,username: admission.user.username, avatar: admission.user.avatar.thumb}.merge(gameinfo: fetch_data(@chat_room.category.game_name, game_id)))
    end
    
      
  end

  # GET /chat_rooms/new
  def new
    @chat_room = ChatRoom.new
  end

  # GET /chat_rooms/1/edit
  def edit
  end
  
  def fetch_data(category, game_id)
        puts "성공!!!!!!"
        case category
        when "lol"
            @game_data = fetch_lol_data(game_id)
        when "ow"
            @game_data = fetch_ow_data(game_id)
        when "pubg"
            @game_data = fetch_pubg_data(game_id)
        else
            puts "게임을 정확히 입력해주세요!"
        end
        
        puts "최종 데이터 확인"
        return @game_data
    end
    
   def fetch_lol_data(game_id)
        # 먼저 다른 정보를 가져오기 위한 소환사의 summonerId 와 accountId를 가져온다
        url = URI.encode("https://kr.api.riotgames.com/lol/summoner/v3/summoners/by-name/#{game_id}?api_key=#{ENV["LOL_API_KEY"]}")
        puts "##########" + url
        user_lol_info = RestClient.get(url)
        user_lol_info = JSON.parse(user_lol_info)
        
        summonerId = user_lol_info["id"]
        accountId = user_lol_info["accountId"]
        
        # AccountId를 이용해 솔랭 게임의 정보를 가져온다
        url = URI.encode("https://kr.api.riotgames.com/lol/match/v3/matchlists/by-account/#{accountId}?queue=420&api_key=#{ENV["LOL_API_KEY"]}")
        user_lol_matches = RestClient.get(url)
        user_lol_matches = JSON.parse(user_lol_matches)
        user_lanes = []
        user_lol_matches["matches"].each do |match|
            user_lanes.push(match["lane"])
        end
        user_lanes = Hash[user_lanes.group_by(&:itself).map {|k,v| [k, v.size] }]
        user_lanes = user_lanes.sort_by {|k, v| v}.reverse
        pos1 = user_lanes[0][0]
        pos2 = user_lanes[1][0]
        
        # SummonerId를 이용해 티어를 가져온다
        url = URI.encode("https://kr.api.riotgames.com/lol/league/v3/positions/by-summoner/#{summonerId}?api_key=#{ENV["LOL_API_KEY"]}")
        user_lol_league = RestClient.get(url)
        user_lol_league = JSON.parse(user_lol_league)
        tier = user_lol_league[0]["tier"]
        
        return game_date = {"티어": tier, "주 포지션": pos1}
        
    end
    
    def fetch_pubg_data(game_id)
        # PubG opgg 점수 크롤링 
        url = URI.encode("https://dak.gg/profile/" + game_id)
        page = Nokogiri::HTML(open(url))
        soloMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[1]/div[1]/div[1]/div[2]/span[1]').text
        duoMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[2]/div[1]/div[1]/div[2]/span[1]').text
        squadMMR = page.xpath('//*[@id="profile"]/div[3]/div[1]/section[3]/div[1]/div[1]/div[2]/span[1]').text
        
        puts "------데이터-------"
        puts soloMMR
        puts duoMMR
        puts squadMMR
        
        return game_data = {"Solo MMR": soloMMR, "Duo MMR": duoMMR, "Squad MMR": squadMMR}   
    end
    
    def fetch_ow_data(game_id)
        puts "-----------"
        puts game_id
        ow_id = game_id.gsub("#","-")
        puts ow_id
        puts "-----------"
        
        # 오버와치 점수 가져오기
        url = URI.encode("https://www.overbuff.com/players/pc/" + ow_id)
        page = Nokogiri::HTML(open(url))
        mmr = page.css("span .player-skill-rating").text

        # 오버와치 포지션 가져오기
        url = URI.encode("https://www.overbuff.com/players/pc/" + ow_id + "?mode=competitive")
        page = Nokogiri::HTML(open(url))
        pos = page.xpath("/html/body/div[1]/div[3]/div/div[3]/div[2]/div[2]/div/section/article/table/tbody/tr[1]/td[1]/a/img").attr("alt").text
        
        return game_data = {"MMR": mmr, "주 포지션": pos}
    end
  
  
  
  def user_admit_room
    # 현재 유저가 있는 방에서 Join을 눌렀을 때 동작하는 액션
    # 이미 조인한 유저라면 참가한 방입니다 alert
 
      if current_user.joined_room?(@chat_room)
          # Or another way is - chat_room.users.include?(current_user)
          # where function always returns an array object
        render js: "alert('you are already a member!');"
      else
      # 아닐 경우에는 참가
        @chat_room.user_admit_room(current_user)
      end

  end
  
  def user_exit_room
    @chat_room.user_exit_room(current_user)
    
    if @chat_room.room_empty?
      @chat_room.destroy
    end
    
    # redirect_to action: root_path
  end
  
  def chat
    unless params[:message].length.eql?(0)
      @chat_room.chats.create(user_id: current_user.id, message: params[:message])
    end
  end

  # POST /chat_rooms
  # POST /chat_rooms.json
  def create
    @chat_room = ChatRoom.new(chat_room_params)
    respond_to do |format|
      if @chat_room.save
        @chat_room.user_admit_room(current_user)
        format.html { redirect_to @chat_room, notice: 'Chat room was successfully created.' }
      else
        format.html { render :new }
      end
    end
  end

  # PATCH/PUT /chat_rooms/1
  # PATCH/PUT /chat_rooms/1.json
  def update
    respond_to do |format|
      if @chat_room.update(chat_room_params)
        format.html { redirect_to @chat_room, notice: 'Chat room was successfully updated.' }
      else
        format.html { render :edit }
      end
    end
  end

  # DELETE /chat_rooms/1
  # DELETE /chat_rooms/1.json
  def destroy
    @chat_room.user_exit_room(current_user)
    @chat_room.chats.destroy_all
    @chat_room.admissions.destroy_all
    @chat_room.destroy
    
    
    
    redirect_to root_path
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_chat_room
      @chat_room = ChatRoom.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def chat_room_params
      params.fetch(:chat_room, {}).permit(:title, :max_count)
    end
    
    
end
