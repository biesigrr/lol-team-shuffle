import os
import discord
import random

from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv('DISCORD_TOKEN')

client = discord.Client()

def shuffle_roles(members):
    roles = ['top', 'jgl', 'mid', 'adc', 'sup']
    random.shuffle(roles)

    assigned = zip(roles, members)
    return assigned

def generate_roles_response(members):
    if len(members) == 0:
        return '**:x: Cannot shuffle because there is nobody in your voice channel**'

    if len(members) > 5:
        return '**:x: More than 5 members in your voice channel, cannot shuffle**'

    assigned = shuffle_roles(members)
    response = ''

    for r in assigned:
        response += f'<@{r[1].id}>: '
        response += r[0]
        response += '\n'

    return response

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content == "shuffle":
        if message.author.voice is None:
            await message.channel.send('**:x: You must be in a voice channel to use this command**')
            return

        voice_channel = message.author.voice.channel
        members = list(filter(lambda m: not m.bot, voice_channel.members))

        response = generate_roles_response(members)

        await message.channel.send(response)

client.run(TOKEN)