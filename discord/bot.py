import os
import random
from typing import Hashable, List, Tuple

from dotenv import load_dotenv

from discord import ButtonStyle, Client, Intents, Interaction, Member, Message, VoiceChannel

from discord.ui import Button, View, button


class Settings:
    def __init__(self):
        self.user_settings = {}

    def get(self, user: int) -> dict[str, bool]:
        return self.user_settings.get(user, {
            'top': True,
            'jgl': True,
            'mid': True,
            'adc': True,
            'sup': True
        })

    def set(self, user: int, settings: Hashable) -> None:
        self.user_settings[user] = settings


def check_preferences(roles: List[str], members: List[Member], settings: Settings) -> bool:
    for n in range(0, len(members)):
        user_settings = settings.get(members[n].id)
        if not user_settings.get(roles[n]):
            return False

    return True


def shuffle_roles(members: List[Member], settings: Settings) -> List[Tuple[str, Member]] | None:
    roles = ['top', 'jgl', 'mid', 'adc', 'sup']
    matches = False
    for _ in range(0, 10000):
        random.shuffle(roles)
        if check_preferences(roles, members, settings):
            matches = True
            break

    if not matches:
        return None

    assigned = zip(roles, members)
    return assigned


def generate_roles_response(members, settings: Settings) -> str:
    if len(members) == 0:
        return '**:x: Cannot shuffle because there is nobody in your voice channel**'

    if len(members) > 5:
        return '**:x: More than 5 members in your voice channel, cannot shuffle**'

    assigned = shuffle_roles(members, settings)
    response = ''

    if assigned is None:
        return '**:x: Cannot shuffle with current user preferences**'

    for r in assigned:
        response += f'<@{r[1].id}>: '
        response += r[0]
        response += '\n'

    return response


def shuffle_for_voice_channel(voice_channel: VoiceChannel, settings: Settings) -> str:
    members = list(filter(lambda m: not m.bot, voice_channel.members))
    response = generate_roles_response(members, settings)

    return response


class RoleSettingsButton(Button['SettingsView']):
    def __init__(self, settings: Settings, user: int, label: str, style: ButtonStyle):
        super().__init__(label=label, style=style)
        self.user = user
        self.settings = settings

    async def callback(self, interaction: Interaction) -> None:
        user_settings = self.settings.get(self.user)
        user_settings[self.label] = not user_settings[self.label]
        self.settings.set(interaction.user.id, user_settings)

        view = self.view
        view.build_buttons()
        await interaction.response.edit_message(content='', view=view)


class SettingsView(View):
    def __init__(self, settings: Settings, user: int):
        super().__init__()
        self.settings = settings
        self.user = user

        self.build_buttons()

    def build_buttons(self) -> None:
        self.clear_items()
        roles = ['top', 'jgl', 'mid', 'adc', 'sup']
        user_settings = self.settings.get(self.user)
        for role in roles:
            style = ButtonStyle.red
            if user_settings.get(role, True):
                style = ButtonStyle.green

            self.add_item(RoleSettingsButton(
                self.settings, self.user, role, style))


class BotView(View):
    def __init__(self, settings: Settings):
        super().__init__()
        self.settings = settings

    @button(label='Shuffle', style=ButtonStyle.primary)
    async def shuffle_callback(self, interaction: Interaction, button: Button):
        if interaction.user.voice is None:
            await interaction.response.send_message('**:x: You must be in a voice channel to use this command**', ephemeral=True)
            return

        response = shuffle_for_voice_channel(
            interaction.user.voice.channel, self.settings)
        await interaction.response.send_message(response, view=BotView(self.settings))

    @button(label='Settings', style=ButtonStyle.secondary)
    async def settings_callback(self, interaction: Interaction, button: Button):
        user = interaction.user.id
        view = SettingsView(self.settings, user)
        await interaction.response.send_message('', view=view, ephemeral=True)


class ShuffleBot(Client):
    def __init__(self):
        intents = Intents.default()
        intents.message_content = True

        super().__init__(intents=intents)

        self.settings = Settings()

    async def on_message(self, message: Message):
        if message.author == self.user:
            return

        if message.content != 'shuffle':
            return

        if message.author.voice is None:
            await message.channel.send('**:x: You must be in a voice channel to use this command**')
            return

        response = shuffle_for_voice_channel(
            message.author.voice.channel, self.settings)
        await message.channel.send(response, view=BotView(self.settings))


load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

ShuffleBot().run(TOKEN, log_handler=None)
