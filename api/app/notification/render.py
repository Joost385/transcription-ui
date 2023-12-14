from pathlib import Path

import httpx
import jinja2
from decouple import config

BASE_URL = config("BASE_URL")
CONTACT_EMAIL = config("CONTACT_EMAIL")
MJML_RENDER_URL = config("MJML_RENDER_URL")

template_dir = Path(__file__).absolute().parent / "templates"
jinja_loader = jinja2.FileSystemLoader(template_dir)
jinja_env = jinja2.Environment(loader=jinja_loader)


async def render_template(template_name: str, **kwargs) -> str:
    template = jinja_env.get_template(template_name)
    mjml = template.render(
        **kwargs,
        base_url=BASE_URL,
        contact_email=CONTACT_EMAIL,
    )
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url=MJML_RENDER_URL,
            headers= {"Content-Type": "text/plain"},
            content=mjml,
        )
        return response.text
